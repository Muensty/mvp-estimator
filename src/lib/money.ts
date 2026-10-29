export const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const USD_WITH_CENTS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(cents: number): string {
  return (Math.abs(cents) % 100 === 0 ? USD : USD_WITH_CENTS).format(cents / 100);
}

export function dollarsToCents(value: string | number): number {
  const normalized = typeof value === 'number' ? value : Number(value.replace(/[$,]/g, ''));
  return Number.isFinite(normalized) ? Math.round(normalized * 100) : 0;
}

export function centsToInput(cents: number | null): string {
  if (cents === null) return '';
  return (cents / 100).toFixed(2).replace(/\.00$/, '');
}

export function calculateLineFeeCents(hours: number, rateCents: number): number {
  if (!Number.isFinite(hours) || !Number.isFinite(rateCents)) return 0;
  return Math.round(hours * rateCents);
}

export function roundHours(hours: number): number {
  return Math.round((hours + Number.EPSILON) * 100) / 100;
}
