import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ContactCategory, ContactStatus, ProviderStatus } from './types';

export const queryKeys = {
  metrics: ['metrics'] as const,
  providers: (status?: string) => ['providers', status ?? 'all'] as const,
  categories: ['categories'] as const,
  payments: ['payments'] as const,
  reviews: ['reviews'] as const,
  quotes: ['quotes'] as const,
  quote: (id: string) => ['quote', id] as const,
  users: (q?: string, role?: string, page?: number) => ['users', q ?? '', role ?? '', page ?? 1] as const,
  contacts: (status?: string, category?: string, q?: string) =>
    ['contacts', status ?? '', category ?? '', q ?? ''] as const,
};

export function useMediations() {
  return useQuery({ queryKey: ['mediations'] as const, queryFn: api.listMediations });
}

export function useReleaseQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.releaseQuote(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mediations'] });
    },
  });
}

export function useContacts(input: { status?: ContactStatus; category?: ContactCategory; q?: string }) {
  return useQuery({
    queryKey: queryKeys.contacts(input.status, input.category, input.q),
    queryFn: () => api.listContacts(input),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; status?: ContactStatus; adminNotes?: string }) =>
      api.updateContact(args.id, { status: args.status, adminNotes: args.adminNotes }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUsers(input: { q?: string; role?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: queryKeys.users(input.q, input.role, input.page),
    queryFn: () => api.listUsers(input),
    placeholderData: (prev) => prev, // mantém a lista ao trocar de página (sem "flash")
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; role: 'CLIENT' | 'PROVIDER' | 'ADMIN' }) =>
      api.updateUserRole(args.id, args.role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useQuotes() {
  return useQuery({ queryKey: queryKeys.quotes, queryFn: api.listQuotes });
}

export function useQuote(id: string | null) {
  return useQuery({
    queryKey: queryKeys.quote(id ?? ''),
    queryFn: () => api.getQuote(id as string),
    enabled: Boolean(id),
  });
}

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
