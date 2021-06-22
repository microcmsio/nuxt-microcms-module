import { Module } from '@nuxt/types'
const path = require('path')

export interface Options {
  apiKey: string;
  serviceDomain: string;
  mode?: 'server' | 'client';
}

interface Package {
  name: string;
  version: string;
  description: string;
  main: string;
  license: string;
}

interface ModuleWithMeta<T> extends Module<T> {
  meta: Package;
}

const module: ModuleWithMeta<Options> = function(this, options) {
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'microcms.js',
    mode: options.mode,
    options,
  });
};

module.meta = require('../package.json')

export default module;