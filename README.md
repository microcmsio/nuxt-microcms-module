# nuxt-microcms-module

[microCMS](https://microcms.io) integration for [Nuxt](https://nuxt.com/).

Attention❗️  
This module is intended for Nuxt version 3 and 4. If you are using version 2, please perform `npm install nuxt-microcms-module@2` and refer [here](https://github.com/microcmsio/nuxt-microcms-module/tree/v2#readme).

## Getting Started

### Install

```bash
$ npm install nuxt-microcms-module
```

### Setup

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  modules: [
    [
      'nuxt-microcms-module',
      {
        serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
        apiKey: 'YOUR_API_KEY',
        // target: 'server',
      },
    ],
  ],
  // or
  modules: ['nuxt-microcms-module'],
  microCMS: {
    serviceDomain: 'YOUR_DOMAIN',
    apiKey: 'YOUR_API_KEY',
    // target: 'server',
  },
});
```

#### serviceDomain

`String`  
Required.  
Your service id, which is a subdomain of microCMS.

#### apiKey

`String`  
Required.  
Your api-key.  
It can be obtained from the service settings.

#### target

`String` (can be `server` or `all`)  
Default: `server`  
By setting this value to `all`, the api-key you set will be included in the client-side code.  
This will allow the client side to send requests to microCMS.  
If you only want to send requests to microCMS at build time or from the server side, set this value to `server` or leave it blank.

### Hot to use

We provide several custom hooks that can be used globally.  
These are functions that internally wrap useFetch.

```typescript
type useMicroCMSGetList = <T>(
  args: {
    endpoint: string;
    queries?: MicroCMSQueries;
  },
  fetchOptions?: FetchOptions
) => Promise<AsyncData<MicroCMSListResponse<T>>>;
type useMicroCMSGetListDetail = <T>(
  args: {
    endpoint: string;
    contentId: string;
    queries?: MicroCMSQueries;
  },
  fetchOptions?: FetchOptions
) => Promise<AsyncData<T & MicroCMSListContent>>;
type useMicroCMSGetObject = <T>(
  args: {
    endpoint: string;
    queries?: MicroCMSQueries;
  },
  fetchOptions?: FetchOptions
) => Promise<AsyncData<T & MicroCMSObjectContent>>;

// FetchOptions is the same as the second argument option of useFetch provided by Nuxt3.
// AsyncData is the return value of useFetch.
// https://nuxt.com/docs/api/composables/use-fetch
```

```vue
<template>
  <ul>
    <li v-for="blog in blogs?.contents" :key="blog.id">
      <NuxtLink :to="`/${blog.id}`">
        <img
          :src="blog.eyecatch.url"
          :width="blog.eyecatch.width"
          :height="blog.eyecatch.height"
          alt=""
        />
        <span>
          {{ blog.title }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { MicroCMSImage } from 'microcms-js-sdk';

type Blog = {
  title: string;
  eyecatch: MicroCMSImage;
};

const { data: blogs } = await useMicroCMSGetList<Blog>({
  endpoint: 'blogs',
  queries: { fields: ['id', 'title', 'eyecatch'] },
});
</script>
```

#### Use reactive values for query parameters

```vue
<template>
  <input type="text" v-model="queries.q" />
</template>

<script setup lang="ts">
import type { MicroCMSImage } from 'microcms-js-sdk';

type Blog = {
  title: string;
  eyecatch: MicroCMSImage;
};

const queries = reactive({
  q: '',
  fields: ['id', 'title', 'eyecatch'],
});

const { data: blogs, refresh } = await useMicroCMSGetList<Blog>({
  endpoint: 'blogs',
  queries,
});

watch(queries, () => {
  refresh();
});
</script>
```

# LICENSE

Apache-2.0
