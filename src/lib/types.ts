export type Role = 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
export type OtpChannel = 'EMAIL' | 'PHONE';
export type ProviderStatus =
  | 'INVITED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface Metrics {
  clients: number;
  providersTotal: number;
  providersApproved: number;
  providersPending: number;
  quotesTotal: number;
  quotesByStatus: Record<string, number>;
  proposalsTotal: number;
  gmvCents: number;
  grossRevenueCents: number;
  netProfitCents: number;
}

export interface AdminPayment {
  id: string;
  quoteId: string;
  clientName: string;
  providerName: string | null;
  categoryName: string;
  status: string;
  mode: string;
  providerAmountCents: number;
  providerNetCents: number;
  clientTotalCents: number;
  grossRevenueCents: number;
  netProfitCents: number;
  createdAt: string;
}

export interface ProviderItem {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  status: ProviderStatus;
  commissionBps: number;
  asaasWalletId: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconKey: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface InviteResult {
  inviteUrl: string;
  token: string;
  expiresAt: string;
}

export interface Review {
  id: string;
  quoteId: string;
  providerId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
}
