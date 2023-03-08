export default defineNuxtConfig({
  modules: [
    [
      '../src/module',
      {
        serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN ?? 'servicedomain',
        apiKey: process.env.MICROCMS_API_KEY ?? 'apikey',
      },
    ],
  ],
  // or
  // modules: ['../src/module'],
  // microCMS: {
  //   serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  //   apiKey: process.env.MICROCMS_API_KEY,
  // },
});
