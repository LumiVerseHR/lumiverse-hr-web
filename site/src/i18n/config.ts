export const locales = ["en", "hr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

// English lives at the root (/work), Croatian under /hr (/hr/work).
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

// A section of the homepage, from anywhere: /#work or /hr#work.
export const homeAnchor = (locale: Locale, id: string) => (locale === defaultLocale ? `/#${id}` : `/${locale}#${id}`);
