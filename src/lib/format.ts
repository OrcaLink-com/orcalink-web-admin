export function bpsToPercent(bps: number): string {
  return (bps / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}
