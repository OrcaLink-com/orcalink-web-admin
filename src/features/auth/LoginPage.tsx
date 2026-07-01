import { useState } from 'react';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useAuth } from '../../auth/AuthContext';

export function LoginPage() {
  const { requestOtp, verifyOtp, logout } = useAuth();
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { devCode } = await requestOtp('EMAIL', destination.trim());
      setDevCode(devCode ?? null);
      if (devCode) setCode(devCode);
      setStep('verify');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await verifyOtp('EMAIL', destination.trim(), code.trim());
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        await logout();
        setError('Acesso restrito a administradores.');
        setStep('request');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-center text-2xl font-bold text-brand">{brand.name} Admin</h1>
      <p className="mb-8 text-center text-sm text-text-muted">Acesso restrito à equipe.</p>
      {step === 'request' ? (
        <form onSubmit={onRequest} className="space-y-4">
          <input
            type="email"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="email@orcalink.com.br"
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Enviando…' : 'Receber código'}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          {devCode && (
            <p className="rounded-md bg-card px-3 py-2 text-xs text-text-muted">
              Modo dev — código: <strong>{devCode}</strong>
            </p>
          )}
          <input
            inputMode="numeric"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de 6 dígitos"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 tracking-widest"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      )}
    </div>
  );
}
