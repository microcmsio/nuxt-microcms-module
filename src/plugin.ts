import { Plugin } from '@nuxt/types';
import { createClient } from 'microcms-js-sdk';

const plugin: Plugin = function (_, inject) {
  const _options = JSON.parse('<%= serialize(options) %>')
  const client = createClient(_options);

  inject('microcms', client);
}

export default plugin;