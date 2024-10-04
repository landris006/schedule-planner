import { clsx, type ClassValue } from 'clsx';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useQuery<T, U>({
  fetcher,
}: {
  fetcher: (input: U) => Promise<T>;
}) {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<
    'initial' | 'success' | 'loading' | 'error'
  >('initial');

  function fetch(input: U) {
    setStatus('loading');
    fetcher(input)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      })
      .finally(() => {
        setStatus('success');
      });
  }

  return {
    data,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    status,
    fetch,
  };
}
