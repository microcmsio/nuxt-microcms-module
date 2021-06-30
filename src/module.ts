import { Module } from '@nuxt/types';
const path = require('path');

export interface Config {
  apiKey: string;
  serviceDomain: string;
}

export interface Options {
  fileName?: string;
  mode?: 'server' | 'client' | 'all';
  options: Config;
}

interface Package {
  name: string;
  version: string;
  description: string;
  main: string;
  license: string;
}

export interface ModuleWithMeta<T> extends Module<T> {
  meta: Package;
}

const module: ModuleWithMeta<Options> = function (this, moduleOptions) {
  const _options = { ...this.options.microcms, ...moduleOptions };
  const { fileName, mode, options } = _options;
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: fileName || 'microcms.js',
    mode,
    options
  });
};

module.meta = require('../package.json');

export default module;
