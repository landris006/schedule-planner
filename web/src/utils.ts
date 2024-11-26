import { clsx, type ClassValue } from 'clsx';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useQuery<T, U = undefined>({
  fetcher,
  onSuccess,
}: {
  fetcher: (input: U) => Promise<T>;
  onSuccess?: (data: T) => void;
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
        onSuccess?.(data);
        setStatus('success');
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
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

export function parseCookie(cookieString: string): Record<string, string> {
  if (cookieString === '') {
    return {};
  }

  const keyValuePairs = cookieString.split(';').map((cookie) => {
    const [key, ...value] = cookie.split('=');
    return [key, value.join('=')];
  });

  const parsedCookie = keyValuePairs.reduce<Record<string, string>>(
    (obj, cookie) => {
      obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(
        cookie[1].trim(),
      );

      return obj;
    },
    {},
  );

  return parsedCookie;
}

export function floatToHHMM(float: number) {
  const hour = Math.floor(float);
  const minute = Math.floor((float - hour) * 60);
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}
