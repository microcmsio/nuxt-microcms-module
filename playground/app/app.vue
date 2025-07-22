<template>
  <div>Nuxt module playground!</div>
  <div>
    <img
      :src="banner?.image.url"
      :width="banner?.image.width"
      :height="banner?.image.height"
      alt=""
    />
    <a :href="banner?.url">
      {{ banner?.description }}
    </a>
  </div>
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
type Banner = {
  image: MicroCMSImage;
  url: string;
  description: string;
};

const { data: blogs } = await useMicroCMSGetList<Blog>({
  endpoint: 'blogs',
  queries: { fields: ['id', 'title', 'eyecatch'] },
});

const { data: banner } = await useMicroCMSGetObject<Banner>({
  endpoint: 'banner',
});
</script>
