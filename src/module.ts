import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit';
import { defu } from 'defu';

type TargetParam = 'server' | 'all';

export interface ModuleOptions {
  serviceDomain: string;
  apiKey: string;
  target?: TargetParam;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-microcms-module',
    configKey: 'microCMS',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  setup(options, nuxt) {
    // Validate options
    if (!options.serviceDomain) {
      throw new Error('serviceDomain is required');
    }
    if (!options.apiKey) {
      throw new Error('apiKey is required');
    }

    options.target = options.target || 'server';

    // Add runtime config
    nuxt.options.runtimeConfig.microCMS = defu(
      nuxt.options.runtimeConfig.microCMS,
      options
    );
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.microCMS =
      nuxt.options.runtimeConfig.public.microCMS || {};
    nuxt.options.runtimeConfig.public.microCMS.serviceDomain =
      nuxt.options.runtimeConfig.public.microCMS.serviceDomain ||
      nuxt.options.runtimeConfig.microCMS.serviceDomain;

    if (nuxt.options.dev || options.target === 'all') {
      nuxt.options.runtimeConfig.public.microCMS = defu(
        nuxt.options.runtimeConfig.public.microCMS,
        nuxt.options.runtimeConfig.microCMS
      );
    }

    const { resolve } = createResolver(import.meta.url);

    // Add composables
    addImportsDir(resolve('./runtime/composables'));
  },
});

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    serviceDomain: string;
    apiKey: string;
  }
}
