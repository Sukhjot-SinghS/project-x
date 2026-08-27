export const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth();
  const sameYear = s.getFullYear() === e.getFullYear();
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (sameMonth && sameYear) {
    return `${s.toLocaleDateString('en-US', { month: 'short' })} ${s.getDate()} - ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} - ${e.toLocaleDateString('en-US', opts)}, ${e.getFullYear()}`;
};

export const formatBudget = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${amount}`;
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const cn = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');
