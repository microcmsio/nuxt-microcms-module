export default defineNuxtConfig({
  compatibilityDate: '2025-07-18',
  telemetry: false,
  devtools: { enabled: false },
  modules: ['../../../src/module'],
  microCMS: {
    serviceDomain: 'fixture',
    apiKey: 'test-api-key-placeholder',
  },
})
