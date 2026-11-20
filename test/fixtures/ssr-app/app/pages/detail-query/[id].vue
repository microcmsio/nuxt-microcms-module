<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const route = useRoute()
const contentId = Array.isArray(route.params.id)
  ? route.params.id.join('/')
  : String(route.params.id)

const { data } = await useMicroCMSGetListDetail({
  endpoint: 'blogs',
  contentId,
  queries: { limit: 5 },
})
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
