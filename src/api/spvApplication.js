import { useMemo } from "react";
import { endpoints, fetcher } from "src/utils/axios";
import useSWR from "swr";

export function useGetSpvApplications() {
    const URL = endpoints.spvApplication.list;

    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
    const memoizedValue = useMemo(
        () => ({
            applications: data?.applications || [],
            applicationsLoading: isLoading,
            applicationsError: error,
            applicationsValidating: isValidating,
            applicationsEmpty: !isLoading && (!data || data.length === 0),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}
