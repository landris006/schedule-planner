import { LabelContext } from '@/contexts/label/label-context';
import { type Labels, type Locale, labels } from './labels';
import { parseCookie } from '@/utils';

export default function LabelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const parsedCookie = parseCookie(document.cookie);

  const preferredLocale = parsedCookie['locale'] as Locale | undefined;
  const locale = preferredLocale ?? 'en';

  return (
    <LabelContext.Provider
      value={{
        labels: buildLabels(labels, locale),
        locale: locale,
        setLocale: (locale) => {
          document.cookie =
            'locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          document.cookie = `locale=${locale}; path=/;`;

          window.location.reload();
        },
      }}
    >
      {children}
    </LabelContext.Provider>
  );
}

function buildLabels(labels: Labels, locale: Locale) {
  return Object.entries(labels).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof labels] = value[locale];
      return acc;
    },
    {} as Record<keyof typeof labels, string>,
  );
}
