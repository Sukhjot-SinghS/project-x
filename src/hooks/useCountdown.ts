import { useEffect, useState } from 'react';
import { formatCountdown } from '@/lib/utils';

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds <= 0]);

  return { seconds, formatted: formatCountdown(seconds), isExpired: seconds <= 0 };
}
