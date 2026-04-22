import { useMemo } from 'react';
import { endpoints, fetcher } from 'src/utils/axios';
import useSWR from 'swr';

export function useGetPsp() {
  const URL = endpoints.pspMaster.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      psp: data || [],
      pspLoading: isLoading,
      pspError: error,
      pspValidating: isValidating,
      pspEmpty: !isLoading && !data?.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, isLoading, error, isValidating, data?.length]
  );

  return memoizedValue;
}
