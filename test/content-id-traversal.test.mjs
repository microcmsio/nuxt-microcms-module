import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import http from 'node:http'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const fixtureDir = path.join(repoRoot, 'test/fixtures/ssr-app')
const preload = path.join(repoRoot, 'test/preload-microcms-fetch.mjs')
const outputServer = path.join(fixtureDir, '.output/server/index.mjs')
const apiKeyPlaceholder = 'test-api-key-placeholder'
const segment = /^[A-Za-z0-9_-]+$/

let serverProcess
let serverPort
let logFile

async function buildFixture() {
  await rm(path.join(fixtureDir, '.output'), { recursive: true, force: true })
  await rm(path.join(fixtureDir, '.nuxt'), { recursive: true, force: true })
  const prepare = spawn(
    path.join(repoRoot, 'node_modules/.bin/nuxi'),
    ['prepare', path.join(repoRoot, 'playground')],
    { cwd: repoRoot, stdio: 'inherit' }
  )
  const [prepareCode] = await once(prepare, 'exit')
  if (prepareCode !== 0) {
    throw new Error(`nuxi prepare exited ${prepareCode}`)
  }
  const child = spawn(
    path.join(repoRoot, 'node_modules/.bin/nuxi'),
    ['build', fixtureDir],
    { cwd: repoRoot, stdio: 'inherit' }
  )
  const [code] = await once(child, 'exit')
  if (code !== 0) {
    throw new Error(`nuxi build exited ${code}`)
  }
}

async function startServer() {
  logFile = path.join(await mkdtemp(path.join(tmpdir(), 'cms-log-')), 'requests.jsonl')
  await writeFile(logFile, '')
  serverProcess = spawn(process.execPath, ['--import', preload, outputServer], {
    cwd: fixtureDir,
    env: {
      ...process.env,
      PORT: '0',
      NITRO_PORT: '0',
      HOST: '127.0.0.1',
      CMS_REQUEST_LOG: logFile,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  serverProcess.stdout.on('data', (chunk) => {
    logs += chunk
  })
  serverProcess.stderr.on('data', (chunk) => {
    logs += chunk
  })
  const started = Date.now()
  while (!/Listening on|http:\/\/|localhost:\d+|127\.0\.0\.1:\d+/.test(logs)) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`server exited early\n${logs}`)
    }
    if (Date.now() - started > 20000) {
      throw new Error(`server did not listen\n${logs}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  const match = logs.match(/Listening on https?:\/\/(?:127\.0\.0\.1|\[::1\]|localhost):(\d+)/)
  if (!match) {
    throw new Error(`no port in server log\n${logs}`)
  }
  serverPort = match[1]
}

function stopServer() {
  serverProcess?.kill('SIGTERM')
}

async function readLog() {
  const text = await readFile(logFile, 'utf8')
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

async function request(requestPath) {
  await writeFile(logFile, '')
  const body = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: requestPath,
        method: 'GET',
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
  const records = await readLog()
  return { ...body, records }
}

function assertConfined(records, expected) {
  assert.ok(records.length > 0, 'expected a microCMS request')
  for (const record of records) {
    assert.equal(record.method, 'GET')
    assert.equal(record.origin, 'https://fixture.microcms.io')
    assert.equal(record.apiKeyHeader, apiKeyPlaceholder)
    const url = new URL(record.path, record.origin)
    assert.equal(url.origin, 'https://fixture.microcms.io')
    const parts = url.pathname.split('/').filter(Boolean)
    assert.deepEqual(parts.slice(0, 2), ['api', 'v1'])
    assert.equal(parts[2], expected.endpoint)
    assert.match(parts[2], segment)
    if (expected.contentId) {
      assert.equal(parts.length, 4)
      assert.equal(parts[3], expected.contentId)
      assert.match(parts[3], segment)
    } else {
      assert.equal(parts.length, 3)
    }
    if (expected.search) {
      assert.equal(url.search, expected.search)
    } else {
      assert.equal(url.search, '')
    }
    assert.equal(url.hash, '')
  }
}

function assertRefused(result) {
  assert.equal(
    result.body.includes('OTHER_API_BODY'),
    false,
    `response leaked another content API\nstatus ${result.status}\nrecords ${JSON.stringify(result.records)}\n${result.body.slice(0, 500)}`
  )
  assert.deepEqual(
    result.records,
    [],
    `a microCMS request was sent for a rejected id: ${JSON.stringify(result.records)}`
  )
}

describe('microCMS path confinement', { concurrency: 1 }, () => {
before(async () => {
  await buildFixture()
  await startServer()
})

after(() => {
  stopServer()
})

test('a normal detail id is fetched as one segment with the server api key', async () => {
  const result = await request('/detail/hello-world')
  assert.equal(result.status, 200)
  assert.match(result.body, /SAFE_BLOG_BODY/)
  assertConfined(result.records, { endpoint: 'blogs', contentId: 'hello-world' })
})

test('a normal list endpoint stays on that content API', async () => {
  const result = await request('/list/blogs')
  assert.equal(result.status, 200)
  assert.match(result.body, /SAFE_BLOG_BODY/)
  assertConfined(result.records, { endpoint: 'blogs' })
})

test('a normal object endpoint stays on that content API', async () => {
  const result = await request('/object/banner')
  assert.equal(result.status, 200)
  assert.match(result.body, /SAFE_BLOG_BODY/)
  assertConfined(result.records, { endpoint: 'banner' })
})

test('an explicit query stays on the detail resource', async () => {
  const result = await request('/detail-query/hello-world')
  assert.equal(result.status, 200)
  assert.match(result.body, /SAFE_BLOG_BODY/)
  assertConfined(result.records, {
    endpoint: 'blogs',
    contentId: 'hello-world',
    search: '?limit=5',
  })
})

test('a backslash in a one-segment detail id cannot switch content APIs', async () => {
  const result = await request('/detail/..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

test('a backslash without a query cannot switch content APIs', async () => {
  const result = await request('/detail/..%5Cother-api')
  assertRefused(result)
})

test('a percent-encoded slash in a detail id cannot switch content APIs', async () => {
  const result = await request('/detail/..%2Fother-api%3Flimit%3D100')
  assertRefused(result)
})

test('a question mark encoded in a path segment is not forwarded as a microCMS query', async () => {
  const result = await request('/detail/hello-world%3Flimit%3D100')
  assert.equal(result.status, 200)
  assertConfined(result.records, { endpoint: 'blogs', contentId: 'hello-world' })
})

test('a question mark inside a content id cannot add a limit query', async () => {
  const result = await request('/by-query?contentId=hello-world%3Flimit%3D100')
  assertRefused(result)
})

test('a question mark inside a content id cannot add an offset query', async () => {
  const result = await request('/by-query?contentId=hello-world%3Foffset%3D100')
  assertRefused(result)
})

test('a dot segment in a detail id cannot leave the endpoint', async () => {
  const result = await request('/detail/%2E%2E%5Cother-api')
  assertRefused(result)
})

test('a catch-all id with an encoded slash cannot switch content APIs', async () => {
  const result = await request('/catch/..%2Fother-api%3Flimit%3D100')
  assertRefused(result)
})

test('a catch-all id with an encoded dot segment is not fetched', async () => {
  const result = await request('/catch/%2E%2E/other-api')
  assertRefused(result)
})

test('a catch-all id with a backslash cannot switch content APIs', async () => {
  const result = await request('/catch/..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

test('a detail id supplied as a query value cannot switch content APIs', async () => {
  const result = await request('/by-query?contentId=..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

test('queries passed with a hostile detail id cannot retarget the request', async () => {
  const result = await request('/detail-query/..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

test('a list endpoint from the route cannot escape /api/v1', async () => {
  const result = await request('/list/..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

test('an object endpoint from the route cannot escape /api/v1', async () => {
  const result = await request('/object/..%5Cother-api')
  assertRefused(result)
})

test('both endpoint and content id from the route stay on one segment each', async () => {
  const safe = await request('/both/news/hello-world')
  assert.equal(safe.status, 200)
  assert.match(safe.body, /SAFE_BLOG_BODY/)
  assertConfined(safe.records, { endpoint: 'news', contentId: 'hello-world' })

  const badEndpoint = await request('/both/..%5Cother-api/hello-world')
  assertRefused(badEndpoint)
})

test('a content id cannot escape the endpoint chosen beside it', async () => {
  const result = await request('/both/blogs/..%5Cother-api%3Flimit%3D100')
  assertRefused(result)
})

})
