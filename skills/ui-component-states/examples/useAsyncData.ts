import { useState, useEffect, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export interface UseAsyncDataReturn<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom hook to manage the 4-state lifecycle of asynchronous data fetching:
 * - Loading: Initial fetch or active refetch
 * - Error: Network or validation failure
 * - Empty: Data resolves to null or an empty array
 * - Success: Non-empty data payload
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: { immediate?: boolean } = { immediate: true }
): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.immediate ?? true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  // Compute if data is considered empty (null, undefined, or empty array)
  const isEmpty =
    !isLoading &&
    !error &&
    (data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0));

  return {
    data,
    isLoading,
    error,
    isEmpty,
    refetch: execute,
    setData,
  };
}
