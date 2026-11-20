import { appendFileSync } from 'node:fs'
import { MockAgent, setGlobalDispatcher } from 'undici'

const logFile = process.env.CMS_REQUEST_LOG
if (!logFile) {
  throw new Error('CMS_REQUEST_LOG is required')
}

const agent = new MockAgent()
agent.disableNetConnect()
setGlobalDispatcher(agent)

const pool = agent.get('https://fixture.microcms.io')
pool
  .intercept({ path: /.*/, method: 'GET' })
  .reply((opts) => {
    const headers = {}
    for (const [name, value] of Object.entries(opts.headers ?? {})) {
      headers[name.toLowerCase()] = String(value)
    }
    appendFileSync(
      logFile,
      JSON.stringify({
        origin: opts.origin,
        path: opts.path,
        method: opts.method,
        apiKeyHeader: headers['x-microcms-api-key'] ?? null,
      }) + '\n'
    )
    const requestPath = String(opts.path)
    const pathname = requestPath.split('?')[0]
    const allowedPath =
      pathname === '/api/v1/blogs' ||
      pathname === '/api/v1/banner' ||
      pathname === '/api/v1/blogs/hello-world' ||
      pathname === '/api/v1/news/hello-world'
    const body = allowedPath
      ? { id: 'hello-world', title: 'SAFE_BLOG_BODY', echoedPath: requestPath }
      : {
          contents: [{ id: 'other-record', title: 'OTHER_API_BODY' }],
          totalCount: 2,
          echoedPath: requestPath,
        }
    return {
      statusCode: 200,
      data: JSON.stringify(body),
      responseOptions: {
        headers: { 'content-type': 'application/json' },
      },
    }
  })
  .persist()
