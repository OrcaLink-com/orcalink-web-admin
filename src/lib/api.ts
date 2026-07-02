import type {
  AdminPayment,
  AdminQuoteDetail,
  AdminQuoteListItem,
  AdminUser,
  AuthUser,
  Category,
  InviteResult,
  Metrics,
  OtpChannel,
  ProviderItem,
  ProviderStatus,
  Review,
  TokenResponse,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const ACCESS_KEY = 'ola_access';
const REFRESH_KEY = 'ola_refresh';
const USER_KEY = 'ola_user';

let onAuthLost: (() => void) | null = null;
export function setAuthLostHandler(fn: (() => void) | null): void {
  onAuthLost = fn;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

function storeSession(res: TokenResponse): void {
  localStorage.setItem(ACCESS_KEY, res.accessToken);
  localStorage.setItem(REFRESH_KEY, res.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

const getAccess = () => localStorage.getItem(ACCESS_KEY);
const getRefresh = () => localStorage.getItem(REFRESH_KEY);

async function parseError(res: Response): Promise<Error> {
  let message = `Erro ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (body?.message) {
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    }
  } catch {
    /* sem corpo JSON */
  }
  return new Error(message);
}

function doFetch(path: string, init: RequestInit, auth: boolean): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccess();
  if (auth && token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

let refreshing: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refreshToken = getRefresh();
  if (!refreshToken) return Promise.resolve(false);
  refreshing = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as TokenResponse;
      const user = getStoredUser();
      if (user) storeSession({ ...data, user });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  let res = await doFetch(path, init, auth);
  if (res.status === 401 && auth) {
    const ok = await tryRefresh();
    if (ok) {
      res = await doFetch(path, init, true);
    } else {
      clearSession();
      onAuthLost?.();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function body(method: string, data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

export const api = {
  // Auth
  requestOtp(channel: OtpChannel, destination: string) {
    return request<{ sent: boolean; devCode?: string }>(
      '/auth/otp/request',
      body('POST', { channel, destination }),
      false,
    );
  },
  async verifyOtp(channel: OtpChannel, destination: string, code: string) {
    const res = await request<TokenResponse>(
      '/auth/otp/verify',
      body('POST', { channel, destination, code }),
      false,
    );
    storeSession(res);
    return res.user;
  },
  async logout() {
    const refreshToken = getRefresh();
    try {
      if (refreshToken) await request('/auth/logout', body('POST', { refreshToken }), false);
    } finally {
      clearSession();
    }
  },

  // Admin
  metrics() {
    return request<Metrics>('/admin/metrics');
  },
  listPayments() {
    return request<AdminPayment[]>('/admin/payments');
  },
  listReviews() {
    return request<Review[]>('/admin/reviews');
  },
  moderateReview(id: string, isHidden: boolean) {
    return request<Review>(`/admin/reviews/${id}`, body('PATCH', { isHidden }));
  },
  listProviders(status?: ProviderStatus) {
    const qs = status ? `?status=${status}` : '';
    return request<ProviderItem[]>(`/admin/providers${qs}`);
  },
  approveProvider(id: string) {
    return request<ProviderItem>(`/admin/providers/${id}/approve`, { method: 'POST' });
  },
  rejectProvider(id: string) {
    return request<ProviderItem>(`/admin/providers/${id}/reject`, { method: 'POST' });
  },
  setCommission(id: string, commissionBps: number) {
    return request<ProviderItem>(
      `/admin/providers/${id}/commission`,
      body('PATCH', { commissionBps }),
    );
  },
  createRecebedor(id: string) {
    return request<ProviderItem>(`/admin/providers/${id}/recebedor`, { method: 'POST' });
  },
  createInvite(input: { email?: string; phone?: string }) {
    return request<InviteResult>('/admin/invites', body('POST', input));
  },
  listCategories() {
    return request<Category[]>('/admin/categories');
  },
  createCategory(input: { slug: string; name: string; iconKey?: string; sortOrder?: number }) {
    return request<Category>('/admin/categories', body('POST', input));
  },
  updateCategory(
    id: string,
    input: { name?: string; isActive?: boolean; sortOrder?: number; iconKey?: string },
  ) {
    return request<Category>(`/admin/categories/${id}`, body('PATCH', input));
  },
  // Observabilidade
  listQuotes() {
    return request<AdminQuoteListItem[]>('/admin/quotes');
  },
  getQuote(id: string) {
    return request<AdminQuoteDetail>(`/admin/quotes/${id}`);
  },
  // Usuários
  listUsers(input?: { q?: string; role?: string }) {
    const qs = new URLSearchParams();
    if (input?.q) qs.set('q', input.q);
    if (input?.role) qs.set('role', input.role);
    const s = qs.toString();
    return request<AdminUser[]>(`/admin/users${s ? `?${s}` : ''}`);
  },
  updateUserRole(id: string, role: 'CLIENT' | 'PROVIDER' | 'ADMIN') {
    return request<AdminUser>(`/admin/users/${id}/role`, body('PATCH', { role }));
  },
};
