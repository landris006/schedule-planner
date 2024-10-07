import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import type { Labels, Locale } from './labels';

type LabelContextType = {
  locale: Locale;
  labels: Record<keyof Labels, string>;
  setLocale: Dispatch<SetStateAction<Locale>>;
};

export const LabelContext = createContext<LabelContextType | undefined>(
  undefined,
);

export function useLabel() {
  const context = useContext(LabelContext);

  if (!context) {
    throw new Error('useLabel must be used within a LabelProvider');
  }
  return context;
}
