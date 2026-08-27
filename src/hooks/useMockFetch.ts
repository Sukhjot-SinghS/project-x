import { useEffect, useState, useRef } from 'react';

export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMockFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fnRef.current();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Something went wrong.';
          setError(message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchKey]);

  return { data, isLoading, error, refetch: () => setRefetchKey((k) => k + 1) };
}
