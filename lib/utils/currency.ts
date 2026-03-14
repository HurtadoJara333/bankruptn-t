/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number,
  currency = 'COP',
  locale  = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style:                 'currency',
    currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount);
}

/**
 * Formats number as short balance (e.g: 1.2M, 45K)
 */
export function formatBalanceShort(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

/**
 * Formats relative date (X minutes ago, yesterday, etc.)
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 1)   return 'Just now';
  if (minutes < 60)  return `${minutes} min ago`;
  if (hours   < 24)  return `${hours}h ago`;
  if (days    === 1) return 'Yesterday';
  if (days    < 7)   return `${days} days ago`;

  return date.toLocaleDateString('en-US', {
    day:   'numeric',
    month: 'short',
    year:  days > 365 ? 'numeric' : undefined,
  });
}

/**
 * Formats phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Account number mask (e.g: •••• •••• 4521)
 */
export function maskAccountNumber(accountNumber: string): string {
  return `•••• •••• ${accountNumber.slice(-4)}`;
}

/**
 * Gets color and icon according to transaction type
 */
export function getTransactionMeta(type: string, isIncoming: boolean) {
  const isPositive = isIncoming || type === 'deposit' || type === 'receive';
  return {
    sign:      isPositive ? '+' : '-',
    colorClass: isPositive ? 'text-mint-400' : 'text-danger',
    bgClass:    isPositive ? 'bg-mint-400/10' : 'bg-danger/10',
  };
}
