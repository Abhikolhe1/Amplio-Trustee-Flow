import useSWR from 'swr';
import { useMemo } from 'react';
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

export function useGetAllInvestmentOrders() {
  const { data, isLoading, error, mutate } = useSWR(endpoints.investmentOrders.list, fetcher);
  return useMemo(
    () => ({
      orders: data?.data ?? data ?? [],
      ordersLoading: isLoading,
      ordersError: error,
      refreshOrders: () => mutate(),
    }),
    [data, error, isLoading, mutate]
  );
}

export function useGetAllRedemptionOrders() {
  const { data, isLoading, error, mutate } = useSWR(endpoints.redemptionOrders.list, fetcher);
  return useMemo(
    () => ({
      redemptionOrders: data?.data ?? data ?? [],
      redemptionOrdersLoading: isLoading,
      redemptionOrdersError: error,
      refreshRedemptionOrders: () => mutate(),
    }),
    [data, error, isLoading, mutate]
  );
}

// Map verification status → order status when the admin API doesn't return a standard `status` field
const VERIFICATION_TO_ORDER_STATUS = {
  ALLOCATED: 'PAYMENT_SUCCESS',
  COMPLETED: 'PAYMENT_SUCCESS',
  PENDING: 'PAYMENT_UNDER_REVIEW',
  PROCESSING: 'PAYMENT_UNDER_REVIEW',
  SUBMITTED: 'UTR_SUBMITTED',
  FAILED: 'PAYMENT_FAILED',
  REJECTED: 'PAYMENT_FAILED',
  CANCELLED: 'CANCELLED',
};

function resolveOrder(data) {
  const raw = data?.data ?? data ?? null;
  if (!raw) return null;

  // The admin endpoint wraps the order inside an investmentOrder / order key
  const nested = raw.investmentOrder ?? raw.order ?? raw.investment ?? null;
  const base = nested && (nested.id || nested.status) ? nested : raw;

  // Backend returns investorName at the top level of data (alongside the nested order object)
  const merged = nested && (nested.id || nested.status)
    ? {
        ...base,
        // top-level verification fields
        utrNumber: base.utrNumber ?? raw.utrNumber,
        verificationStatus: base.verificationStatus ?? raw.verificationStatus,
        utrSubmittedAt: base.utrSubmittedAt ?? raw.utrSubmittedAt,
        // top-level investor fields (computed by backend service, not on the order model)
        investorName: raw.investorName || base.investorName || null,
        investorEmail: raw.investorEmail || base.investorEmail || null,
      }
    : {
        ...base,
        investorName: raw.investorName || base.investorName || null,
        investorEmail: raw.investorEmail || base.investorEmail || null,
      };

  // Derive status from verificationStatus when the main status field is absent
  if (!merged.status && merged.verificationStatus) {
    merged.status = VERIFICATION_TO_ORDER_STATUS[merged.verificationStatus] ?? merged.status;
  }

  console.log('[investment-orders] resolved order:', merged);
  return merged;
}

export function useGetInvestmentOrderById(orderId) {
  const URL = orderId ? endpoints.investmentOrders.byId(orderId) : null;
  const { data, isLoading, error, mutate } = useSWR(URL, fetcher);
  return useMemo(
    () => ({
      order: resolveOrder(data),
      orderLoading: isLoading,
      orderError: error,
      refreshOrder: () => mutate(),
    }),
    [data, error, isLoading, mutate]
  );
}

export function useGetRedemptionOrderById(payoutId) {
  const URL = payoutId ? endpoints.redemptionOrders.byId(payoutId) : null;
  const { data, isLoading, error, mutate } = useSWR(URL, fetcher);
  return useMemo(
    () => ({
      order: data?.data ?? null,
      orderLoading: isLoading,
      orderError: error,
      refreshOrder: () => mutate(),
    }),
    [data, error, isLoading, mutate]
  );
}

export async function updateInvestmentOrderStatus(orderId, payload) {
  const response = await axiosInstance.patch(
    endpoints.investmentOrders.byId(orderId),
    payload
  );
  return response.data?.data ?? response.data;
}
