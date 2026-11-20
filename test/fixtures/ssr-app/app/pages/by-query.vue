<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const route = useRoute()
const raw = route.query.contentId
const contentId = Array.isArray(raw) ? raw.join('/') : String(raw ?? '')

const { data } = await useMicroCMSGetListDetail({
  endpoint: 'blogs',
  contentId,
})
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
