import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ProviderStatus } from './types';

export const queryKeys = {
  metrics: ['metrics'] as const,
  providers: (status?: string) => ['providers', status ?? 'all'] as const,
  categories: ['categories'] as const,
  payments: ['payments'] as const,
  reviews: ['reviews'] as const,
};

export function useReviews() {
  return useQuery({ queryKey: queryKeys.reviews, queryFn: api.listReviews });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; isHidden: boolean }) =>
      api.moderateReview(args.id, args.isHidden),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

export function useMetrics() {
  return useQuery({ queryKey: queryKeys.metrics, queryFn: api.metrics });
}

export function usePayments() {
  return useQuery({ queryKey: queryKeys.payments, queryFn: api.listPayments });
}

export function useProviders(status?: ProviderStatus) {
  return useQuery({
    queryKey: queryKeys.providers(status),
    queryFn: () => api.listProviders(status),
  });
}

function useProviderMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['providers'] });
      void qc.invalidateQueries({ queryKey: queryKeys.metrics });
    },
  });
}

export function useApproveProvider() {
  return useProviderMutation((id: string) => api.approveProvider(id));
}
export function useRejectProvider() {
  return useProviderMutation((id: string) => api.rejectProvider(id));
}
export function useSetCommission() {
  return useProviderMutation((args: { id: string; commissionBps: number }) =>
    api.setCommission(args.id, args.commissionBps),
  );
}
export function useCreateRecebedor() {
  return useProviderMutation((id: string) => api.createRecebedor(id));
}

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: api.listCategories });
}

export function useCategoryMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}
