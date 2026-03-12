/**
 * Formatea un número como moneda
 */
export function formatCurrency(
  amount: number,
  currency = 'COP',
  locale  = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    style:                 'currency',
    currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount);
}

/**
 * Formatea número como balance corto (ej: 1.2M, 45K)
 */
export function formatBalanceShort(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

/**
 * Formatea fecha relativa (hace X minutos, ayer, etc.)
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 1)   return 'Ahora mismo';
  if (minutes < 60)  return `Hace ${minutes} min`;
  if (hours   < 24)  return `Hace ${hours}h`;
  if (days    === 1) return 'Ayer';
  if (days    < 7)   return `Hace ${days} días`;

  return date.toLocaleDateString('es-CO', {
    day:   'numeric',
    month: 'short',
    year:  days > 365 ? 'numeric' : undefined,
  });
}

/**
 * Formatea número de teléfono para mostrar
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Máscara de número de cuenta (ej: •••• •••• 4521)
 */
export function maskAccountNumber(accountNumber: string): string {
  return `•••• •••• ${accountNumber.slice(-4)}`;
}

/**
 * Obtiene color e ícono según tipo de transacción
 */
export function getTransactionMeta(type: string, isIncoming: boolean) {
  const isPositive = isIncoming || type === 'deposit' || type === 'receive';
  return {
    sign:      isPositive ? '+' : '-',
    colorClass: isPositive ? 'text-mint-400' : 'text-danger',
    bgClass:    isPositive ? 'bg-mint-400/10' : 'bg-danger/10',
  };
}
