export const formatINR = (
  amount: number | null | undefined,
  options?: { showSign?: boolean; absolute?: boolean }
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const val = options?.absolute ? Math.abs(amount) : amount;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(val));

  if (options?.showSign) {
    if (val > 0) return `+${formatted}`;
    if (val < 0) return `-${formatted}`;
  }

  return val < 0 ? `-${formatted}` : formatted;
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
};

export const formatMonthName = (monthStr: string): string => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr || '2026', 10);
  const monthNum = parseInt(monthNumStr || '1', 10) - 1;
  const d = new Date(Date.UTC(year, monthNum, 1));
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(d);
};
