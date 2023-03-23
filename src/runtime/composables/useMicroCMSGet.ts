import {
  MicroCMSListResponse,
  MicroCMSListContent,
  MicroCMSObjectContent,
  MicroCMSQueries,
} from 'microcms-js-sdk';
import { useFetch, useRuntimeConfig } from 'nuxt/app';
import type { FetchOptions as _FetchOptions } from 'ofetch';
import { computed } from 'vue';

import { useMicroCMSUrl } from './useMicroCMSUrl';

type MicroCMSGetArgs = {
  url: string;
  queries?: MicroCMSQueries;
};

type MicroCMSGetListArgs = {
  endpoint: string;
  queries?: MicroCMSQueries;
};

type MicroCMSGetListDetailArgs = {
  endpoint: string;
  contentId: string;
  queries?: MicroCMSQueries;
};

type MicroCMSGetObjectArgs = {
  endpoint: string;
  queries?: MicroCMSQueries;
};

type FetchOptions = Omit<_FetchOptions<'json'>, 'baseURL' | 'query' | 'method'>;

const method = 'GET';

const useMicroCMSGet = <T>(
  { url, queries }: MicroCMSGetArgs,
  fetchOptions: FetchOptions = {}
) => {
  const baseURL = useMicroCMSUrl();
  const config = useRuntimeConfig();

  const query = computed<MicroCMSQueries | undefined>(() =>
    queries
      ? {
          ...queries,
          fields: queries.fields?.toString(),
          ids: queries.ids?.toString(),
        }
      : undefined
  );

  return useFetch<T>(url, {
    ...fetchOptions,
    baseURL,
    query,
    headers: {
      'X-MICROCMS-API-KEY': config.microCMS?.apiKey,
      ...fetchOptions.headers,
    },
    method,
  });
};

export const useMicroCMSGetList = <T>(
  { endpoint, queries }: MicroCMSGetListArgs,
  fetchOptions: FetchOptions = {}
) => {
  return useMicroCMSGet<MicroCMSListResponse<T>>(
    { url: endpoint, queries },
    fetchOptions
  );
};

export const useMicroCMSGetListDetail = <T>(
  { endpoint, contentId, queries }: MicroCMSGetListDetailArgs,
  fetchOptions: FetchOptions = {}
) => {
  return useMicroCMSGet<T & MicroCMSListContent>(
    { url: `${endpoint}/${contentId}`, queries },
    fetchOptions
  );
};

export const useMicroCMSGetObject = <T>(
  { endpoint, queries }: MicroCMSGetObjectArgs,
  fetchOptions: FetchOptions = {}
) => {
  return useMicroCMSGet<T & MicroCMSObjectContent>(
    { url: endpoint, queries },
    fetchOptions
  );
};
