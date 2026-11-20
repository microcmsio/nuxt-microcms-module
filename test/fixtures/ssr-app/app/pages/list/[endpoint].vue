<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const route = useRoute()
const endpoint = Array.isArray(route.params.endpoint)
  ? route.params.endpoint.join('/')
  : String(route.params.endpoint)

const { data } = await useMicroCMSGetList({ endpoint })
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
