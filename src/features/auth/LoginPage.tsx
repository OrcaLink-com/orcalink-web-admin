import { useEffect, useState } from 'react';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useAuth } from '../../auth/AuthContext';
import { Card, Input, Button, InlineError } from '../../components/ui';

export function LoginPage() {
  const { requestOtp, verifyOtp, logout } = useAuth();
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Limpa o erro assim que o usuário edita o e-mail/código.
  useEffect(() => {
    setError(null);
  }, [destination, code]);

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
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <Card className="p-6 shadow-pop">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/brand/mark.svg" alt={brand.name} className="h-14 w-14" />
          <div>
            <p className="text-lg font-bold">
              {brand.name} <span className="text-primary">Admin</span>
            </p>
            <p className="text-sm text-text-muted">Acesso restrito à equipe.</p>
          </div>
        </div>

        {step === 'request' ? (
          <form onSubmit={onRequest} className="space-y-4">
            <Input
              type="email"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="email@orcalink.com.br"
            />
            <InlineError message={error} />
            <Button type="submit" full loading={loading}>
              Receber código
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            {devCode && (
              <p className="rounded-medium bg-card-2 px-3 py-2 text-xs text-text-muted">
                Modo dev — código: <strong>{devCode}</strong>
              </p>
            )}
            <Input
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="tracking-widest"
            />
            <InlineError message={error} />
            <Button type="submit" full loading={loading}>
              Entrar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
