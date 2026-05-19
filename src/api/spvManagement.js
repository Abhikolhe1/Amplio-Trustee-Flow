import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';

/**
 * @typedef {Object} SpvEscrowRecentTransaction
 * @property {number} amount
 * @property {string} direction
 * @property {string} transactionType
 * @property {string} createdAt
 * @property {string} referenceMovementId
 * @property {string} status
 */

/**
 * @typedef {Object} SpvEscrowAccount
 * @property {string} bankName
 * @property {string} accountNumber
 * @property {string} maskedAccountNumber
 * @property {string} ifscCode
 * @property {string} branchDetails
 * @property {number} currentBalance
 * @property {number} totalCredits
 * @property {number} totalDebits
 * @property {string} currency
 * @property {string} status
 * @property {SpvEscrowRecentTransaction[]} recentTransactions
 */

/**
 * @typedef {Object} SpvManagementListItem
 * @property {string} spvId
 * @property {string} spvReference
 * @property {string} registrationNumber
 * @property {string} name
 * @property {string} issuer
 * @property {string} monitoringTrustee
 * @property {string} monitoringTrusteeId
 * @property {string} incorporationDate
 * @property {string} status
 * @property {number} activePTC
 * @property {number} activeInvestors
 * @property {number} outstandingValue
 * @property {number} reserveFund
 * @property {number} coupon
 * @property {string} maturityDate
 * @property {number} totalPools
 * @property {string} currentPoolId
 * @property {number} currentPoolLimit
 * @property {number} currentPoolOutstanding
 * @property {number} currentPoolUtilizationPercent
 * @property {number} pendingPoolApplications
 * @property {boolean} canCreateNewPool
 * @property {SpvEscrowAccount | null} escrowAccount
 */

/**
 * @typedef {Object} SpvManagementSummary
 * @property {number} totalSpv
 * @property {number} liveIssuances
 * @property {number} aumManaged
 * @property {number} totalPools
 * @property {number} spvsEligibleForNewPool
 */

/**
 * @typedef {Object} SpvManagementPool
 * @property {string} poolId
 * @property {string} applicationId
 * @property {number} reviewStatus
 * @property {string} status
 * @property {number} poolLimit
 * @property {number} outstanding
 * @property {number} utilizationPercent
 * @property {number} coupon
 * @property {string} maturityDate
 * @property {boolean} isCurrentPool
 */

/**
 * @typedef {Object} NewPoolApplication
 * @property {string} id
 * @property {{ id: string, label: string, code: string }} currentStatus
 * @property {boolean} isActive
 * @property {string} spvId
 */

/**
 * @typedef {{ success: boolean, message: string, data: SpvManagementListItem[] }} SpvManagementListResponse
 * @typedef {{ success: boolean, message: string, data: SpvManagementSummary }} SpvManagementSummaryResponse
 * @typedef {{ success: boolean, message: string, data: SpvManagementPool[] }} SpvManagementPoolsResponse
 * @typedef {{ success: boolean, message: string, application: NewPoolApplication }} NewPoolApplicationResponse
 */

export function useGetSpvManagementSummary() {
  const URL = endpoints.spvManagement.summary;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      summary: data?.data || null,
      summaryLoading: isLoading,
      summaryError: error,
      summaryValidating: isValidating,
      refreshSummary: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementList() {
  const URL = endpoints.spvManagement.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      spvList: data?.data || [],
      spvListLoading: isLoading,
      spvListError: error,
      spvListValidating: isValidating,
      spvListEmpty: !isLoading && !(data?.data || []).length,
      refreshSpvList: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementPools(spvId) {
  const URL = spvId ? endpoints.spvManagement.pools(spvId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      pools: data?.data || [],
      poolsLoading: isLoading,
      poolsError: error,
      poolsValidating: isValidating,
      poolsEmpty: !isLoading && !(data?.data || []).length,
      refreshPools: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvUnallocatedFunds(spvId) {
  const URL = spvId ? endpoints.spvManagement.unallocatedFunds(spvId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      unallocatedFunds: data?.data || [],
      unallocatedFundsLoading: isLoading,
      unallocatedFundsError: error,
      unallocatedFundsValidating: isValidating,
      unallocatedFundsEmpty: !isLoading && !(data?.data || []).length,
      refreshUnallocatedFunds: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

async function fetchSpvManagementPoolDetails(poolId) {
  if (!poolId) {
    return { pool: null, spv: null };
  }

  const listResponse = await axiosInstance.get(endpoints.spvManagement.list);
  const spvList = listResponse?.data?.data || [];

  if (!spvList.length) {
    return { pool: null, spv: null };
  }

  const poolCollections = await Promise.all(
    spvList.map(async (spv) => {
      const poolResponse = await axiosInstance.get(endpoints.spvManagement.pools(spv.spvId));

      return {
        spv,
        pools: poolResponse?.data?.data || [],
      };
    })
  );

  for (const collection of poolCollections) {
    const matchedPool = collection.pools.find((item) => item.poolId === poolId);

    if (matchedPool) {
      return {
        pool: matchedPool,
        spv: collection.spv,
      };
    }
  }

  return { pool: null, spv: null };
}

export function useGetSpvManagementPoolDetails(poolId) {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    poolId ? ['spv-management-pool-details', poolId] : null,
    () => fetchSpvManagementPoolDetails(poolId),
    {
      keepPreviousData: true,
    }
  );

  return useMemo(
    () => ({
      pool: data?.pool || null,
      spv: data?.spv || null,
      poolDetailsLoading: isLoading,
      poolDetailsError: error,
      poolDetailsValidating: isValidating,
      refreshPoolDetails: mutate,
    }),
    [data?.pool, data?.spv, error, isLoading, isValidating, mutate]
  );
}

export async function createNewPoolApplication(spvId) {
  const URL = endpoints.spvManagement.newPoolApplication(spvId);
  const res = await axiosInstance.post(URL);
  return res.data;
}
