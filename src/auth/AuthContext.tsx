import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, clearSession, getStoredUser, setAuthLostHandler } from '../lib/api';
import type { AuthUser, OtpChannel } from '../lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  requestOtp: (channel: OtpChannel, destination: string) => Promise<{ devCode?: string }>;
  verifyOtp: (channel: OtpChannel, destination: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    setAuthLostHandler(() => {
      clearSession();
      setUser(null);
    });
    return () => setAuthLostHandler(null);
  }, []);

  const requestOtp = useCallback(
    (channel: OtpChannel, destination: string) => api.requestOtp(channel, destination),
    [],
  );

  const verifyOtp = useCallback(
    async (channel: OtpChannel, destination: string, code: string) => {
      const u = await api.verifyOtp(channel, destination, code);
      setUser(u);
      return u;
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isAdmin, requestOtp, verifyOtp, logout }),
    [user, isAdmin, requestOtp, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
