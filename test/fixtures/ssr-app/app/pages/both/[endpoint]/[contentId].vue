<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const route = useRoute()
const endpoint = Array.isArray(route.params.endpoint)
  ? route.params.endpoint.join('/')
  : String(route.params.endpoint)
const contentId = Array.isArray(route.params.contentId)
  ? route.params.contentId.join('/')
  : String(route.params.contentId)

const { data } = await useMicroCMSGetListDetail({ endpoint, contentId })
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
