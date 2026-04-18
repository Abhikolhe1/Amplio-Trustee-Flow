import { useMemo } from 'react';
import { endpoints, fetcher } from 'src/utils/axios';
import useSWR from 'swr';

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

export function useGetSpvApplication(applicationId) {
  console.log('applicationId', applicationId);
  const URL = applicationId ? endpoints.spvApplication.details(applicationId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  console.log('data', data);
  const memoizedValue = useMemo(
    () => ({
      application: data?.applicationData,
      applicationLoading: isLoading,
      applicationError: error,
      applicationValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// export function useGetSpvApplicationStepData(applicationId, statusValue) {
//   const URL = applicationId && statusValue ? endpoints.spvApplication.dataByStatus(applicationId, statusValue) : null;

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
//   console.log('Data', data);
//   const memoizedValue = useMemo(
//     () => ({
//       stepData: data?.stepData,
//       stepDataLoading: isLoading,
//       stepDataError: error,
//       stepDataValidating: isValidating,
//     }),
//     [data, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }
export function useGetSpvApplicationStepData(applicationId, statusValue) {
  const URL = applicationId && statusValue ? endpoints.spvApplication.dataByStatus(applicationId, statusValue) : null;


  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const refreshDetails = () => {
    mutate();
  };

  return {
    stepData: data?.stepData,
    stepDataLoading: isLoading,
    stepDataError: error,
    stepDataValidating: isValidating,
    refreshDetails,
  };
}

export function useGetPoolFinancial(applicationId) {
  //   console.log('applicationId', applicationId);
  const URL = applicationId ? endpoints.spvApplication.poolFinancial(applicationId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  console.log('poolFinancial', data);

  const memoizedValue = useMemo(
    () => ({
      application: data?.data,
      applicationLoading: isLoading,
      applicationError: error,
      applicationValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetSpvDocument(applicationId) {
  //   console.log('applicationId', applicationId);
  const URL = applicationId ? endpoints.spvApplication.getSpvDocument(applicationId) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDocumentDetails = () => {
    mutate();
  };
  return {
    spvDocuments: data?.documents,
    spvDocumentsLoading: isLoading,
    spvDocumentsError: error,
    spvDocumentsValidating: isValidating,
    refreshDocumentDetails,
  };
}

export function useGetSpvKycDocumentTypes() {
  const URL = endpoints.spvKycDocumentType.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      spvKycDocumentTypes: data || [],
      spvKycDocumentTypesLoading: isLoading,
      spvKycDocumentTypesError: error,
      spvKycDocumentTypesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// import useSWR from 'swr';
// import { useMemo } from 'react';
// // utils
// import { fetcher, endpoints } from 'src/utils/axios';

// // ----------------------------------------------------------------------

// export function useGetBondApplications(filter) {
//     let URL = endpoints.bondApplications.list;

//     if (filter) {
//         URL = endpoints.bondApplications.filterList(filter);
//     }

//     const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//     const memoizedValue = useMemo(
//         () => ({
//             bondApplications: data?.applications || [],
//             count: data?.count || 0,
//             bondApplicationsLoading: isLoading,
//             bondApplicationsError: error,
//             bondApplicationsValidating: isValidating,
//             bondApplicationsEmpty: !isLoading && !data?.applications?.length,
//         }),
//         [data?.applications, error, isLoading, isValidating]
//     );

//     console.log(memoizedValue?.bondApplications)

//     return memoizedValue;
// }

// // ----------------------------------------------------------------------

// export function useGetBondApplication(applicationId) {
//     const URL = applicationId ? endpoints.bondApplications.details(applicationId) : null;

//     const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//     const memoizedValue = useMemo(
//         () => ({
//             bondApplication: data?.applicationData,
//             bondApplicationLoading: isLoading,
//             bondApplicationError: error,
//             bondApplicationValidating: isValidating,
//         }),
//         [data, error, isLoading, isValidating]
//     );

//     return memoizedValue;
// }

// // ----------------------------------------------------------------------

// export function useGetBondApplicationStepData(applicationId, statusValue) {
//     const URL = (applicationId && statusValue) ? endpoints.bondApplications.dataByStatus(applicationId, statusValue) : null;

//     const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//     const memoizedValue = useMemo(
//         () => ({
//             stepData: data?.stepData,
//             stepDataLoading: isLoading,
//             stepDataError: error,
//             stepDataValidating: isValidating,
//         }),
//         [data, error, isLoading, isValidating]
//     );

//     return memoizedValue;
// }
