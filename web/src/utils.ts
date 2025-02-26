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
  onSuccess?: (response: T, input: U) => void;
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
        if (typeof onSuccess === 'function') {
          onSuccess(data, input);
        }
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

export function generateColor(seed: string) {
  const hash = Math.abs(
    seed.split('').reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0),
  );
  const hue = Math.floor(hash % 360) + 1;

  return hslToHex(hue, 100, 30);
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateSemesters() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  const semesters = Array.from(
    { length: 7 },
    (_, i) =>
      `${year - Math.round(i / 2)}-${year + 1 - Math.round(i / 2)}-${(i % 2) + 1}`, // 🤮
  );

  if (month < 5) {
    semesters.shift();
  } else {
    semesters.pop();
  }

  return semesters;
}
