export const useApiFetch = createUseFetch((currentOptions) => {
  const runtimeConfig = useRuntimeConfig();

  return {
    ...currentOptions,
    baseURL: currentOptions.baseURL ?? runtimeConfig.public.apiBase,
    retry: currentOptions.retry ?? 1,
    retryStatusCodes: currentOptions.retryStatusCodes ?? [408, 409, 425, 429, 500, 502, 503, 504],
    timeout: currentOptions.timeout ?? 10_000,
  };
});
