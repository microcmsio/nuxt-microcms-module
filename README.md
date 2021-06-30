# nuxt-microcms-module
[microCMS](https://microcms.io) integration for [Nuxt](https://nuxtjs.org/).

## Getting Started

### Install

```bash
$ npm install nuxt-microcms-module
```

### Setup

```javascript
// nuxt.config.js

export default {
  modules: ['nuxt-microcms-module'],
  microcms: {
    options: {
      serviceDomain: "YOUR_DOMAIN", // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
      apiKey: "YOUR_API_KEY",
    },
    mode: process.env.NODE_ENV === 'production' ? 'server' : 'all',
  },
};
```

#### options.serviceDomain
`String`  
Your service id, which is a subdomain of microCMS.

#### options.apiKey
`String`  
Your api-key.  
It can be obtained from the service settings. 

#### mode
`String` (can be `client` or `server`)  
If defined, the file will be included only on the respective (client or server) side.

### Hot to use
This package uses [microcms-js-sdk](https://github.com/microcmsio/microcms-js-sdk).  
You can get microCMS client (`$microcms`) from `context`.  
Please see the URL below for details.  
https://github.com/microcmsio/microcms-js-sdk#how-to-use

```vue
// pages/index.vue

<template>
  <ul>
    <li v-for="content in contents" :key="content.id">
      <nuxt-link :to="`/${content.id}`">
        {{ content.title }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script>
export default {
  async asyncData({ $microcms }) {
    const data = await $microcms.get({
      endpoint: 'your_endpoint',
      queries: { limit: 20, filters: 'createdAt[greater_than]2021' },
    });
    return data;
  }
}
</script>
```

# LICENSE

Apache-2.0
