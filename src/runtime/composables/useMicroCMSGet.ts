import type {
  MicroCMSListResponse,
  MicroCMSListContent,
  MicroCMSObjectContent,
  MicroCMSQueries,
} from 'microcms-js-sdk';
import { useFetch, useRuntimeConfig } from 'nuxt/app';
import type { FetchError } from 'ofetch';
import { computed } from 'vue';

import { useMicroCMSUrl } from './useMicroCMSUrl';

type MicroCMSGetArgs = {
  segments: string[];
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

type FetchOptions<T = void> = Omit<
  Parameters<typeof useFetch<T, FetchError, string, 'get'>>,
  'baseURL' | 'query' | 'method'
>[1];

const method = 'get';

// microCMS endpoints and content IDs only allow these characters, so anything
// else (slashes, backslashes, dots, `?`, `#`, `%`) cannot address the intended resource.
const PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;

const toPath = (segments: unknown[]) =>
  segments
    .map((segment) => {
      if (typeof segment !== 'string' || !PATH_SEGMENT.test(segment)) {
        throw new Error(
          'Invalid microCMS endpoint or contentId: only letters, digits, "-" and "_" are allowed'
        );
      }
      return encodeURIComponent(segment);
    })
    .join('/');

const useMicroCMSGet = <T>(
  { segments, queries }: MicroCMSGetArgs,
  fetchOptions: FetchOptions<T> = {}
) => {
  const url = toPath(segments);
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

  return useFetch<T, FetchError, string, 'get'>(url, {
    ...fetchOptions,
    baseURL,
    query,
    headers: {
      'X-MICROCMS-API-KEY': config.microCMS
        ? config.microCMS.apiKey
        : config.public.microCMS.apiKey,
      ...fetchOptions.headers,
    },
    method,
  });
};

export const useMicroCMSGetList = <T>(
  { endpoint, queries }: MicroCMSGetListArgs,
  fetchOptions: FetchOptions<MicroCMSListResponse<T>> = {}
) => {
  return useMicroCMSGet<MicroCMSListResponse<T>>(
    { segments: [endpoint], queries },
    fetchOptions
  );
};

export const useMicroCMSGetListDetail = <T>(
  { endpoint, contentId, queries }: MicroCMSGetListDetailArgs,
  fetchOptions: FetchOptions<T & MicroCMSListContent> = {}
) => {
  return useMicroCMSGet<T & MicroCMSListContent>(
    { segments: [endpoint, contentId], queries },
    fetchOptions
  );
};

export const useMicroCMSGetObject = <T>(
  { endpoint, queries }: MicroCMSGetObjectArgs,
  fetchOptions: FetchOptions<T & MicroCMSObjectContent> = {}
) => {
  return useMicroCMSGet<T & MicroCMSObjectContent>(
    { segments: [endpoint], queries },
    fetchOptions
  );
};
