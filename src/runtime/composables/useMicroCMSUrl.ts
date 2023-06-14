import { useRuntimeConfig } from 'nuxt/app';

type UseMicroCMSUrl = () => string | undefined;

const VERSION = 'v1';

export const useMicroCMSUrl: UseMicroCMSUrl = () => {
  const config = useRuntimeConfig();

  return `https://${
    config.microCMS
      ? config.microCMS.serviceDomain
      : config.public.microCMS.serviceDomain
  }.microcms.io/api/${VERSION}`;
};
