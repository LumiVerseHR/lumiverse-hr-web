import type { Metadata } from "next";
import { localePath, type Locale } from "@/i18n/config";

export const SITE = "https://www.lumiverse.hr";

const ogLocale = (lang: Locale) => (lang === "hr" ? "hr_HR" : "en_US");

type Seo = {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  // The languages this page exists in; a page without a translation names only its own.
  langs?: Locale[];
  openGraph?: Record<string, unknown>;
};

// Title, description, canonical, hreflang, Open Graph and the X card for one page.
// A page's openGraph replaces the layout's whole object, so every field is set here.
export function seo({ lang, path, title, description, image = "/og/index.jpg", langs = ["en", "hr"], openGraph }: Seo): Metadata {
  const url = localePath(lang, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: Object.fromEntries(langs.map((l) => [l, localePath(l, path)])) },
    openGraph: {
      type: "website",
      siteName: "LumiVerse",
      url,
      title,
      description,
      locale: ogLocale(lang),
      alternateLocale: langs.filter((l) => l !== lang).map(ogLocale),
      images: [image],
      ...openGraph,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// The company and the site, once, on the homepage; other pages point at them by @id.
export const organizationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "LumiVerse d.o.o.",
      alternateName: "LumiVerse",
      url: `${SITE}/`,
      logo: `${SITE}/favicon-512.png`,
      email: "info@lumiverse.hr",
      vatID: "HR88595646800",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Markuševečka cesta 20C",
        addressLocality: "Zagreb",
        postalCode: "10000",
        addressCountry: "HR",
      },
      sameAs: ["https://www.linkedin.com/company/lumiversehr", "https://github.com/LumiVerseHR"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "LumiVerse",
      url: `${SITE}/`,
      inLanguage: ["en", "hr"],
      publisher: { "@id": `${SITE}/#organization` },
    },
  ],
};

// Home > (parent >) page, for pages that don't render a PageHero (which emits its own).
export function breadcrumbLd(lang: Locale, home: string, trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: home, path: "/" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE}${localePath(lang, crumb.path)}`,
    })),
  };
}
