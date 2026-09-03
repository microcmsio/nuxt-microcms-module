// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config';

export default createConfigForNuxt({}).override('nuxt/vue/rules', {
  rules: {
    'vue/html-self-closing': 'off',
  },
});
