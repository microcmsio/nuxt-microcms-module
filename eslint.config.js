// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default createConfigForNuxt({})
  .override('nuxt/vue/rules', {
    rules: {
        'vue/html-self-closing': 'off',
    },
  })
  .prepend(eslintConfigPrettier);

