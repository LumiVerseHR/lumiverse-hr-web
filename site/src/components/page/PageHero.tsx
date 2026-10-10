import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { jsonLdHtml } from "@/lib/jsonld";
import styles from "./Page.module.css";

const SITE = "https://www.lumiverse.hr";

// The top of every inner page: breadcrumb, one heading, one intro, optional actions.
export function PageHero({
  lang,
  path,
  home,
  label,
  title,
  intro,
  children,
}: {
  lang: Locale;
  path: string;
  home: string;
  label: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: home, item: `${SITE}${localePath(lang)}` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE}${localePath(lang, path)}` },
    ],
  };
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(crumbs)} />
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <a href={localePath(lang)}>{home}</a>
        <span aria-hidden>/</span>
        <span aria-current="page">{label}</span>
      </nav>
      <h1 id="page-title" className={styles.title}>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </section>
  );
}

// Title, description and both language URLs for an inner page.
export function pageMetadata(lang: Locale, path: string, title: string, description: string, image = "/og/index.jpg"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: localePath(lang, path), languages: { en: path, hr: localePath("hr", path) } },
    openGraph: { title, description, url: localePath(lang, path), images: [image] },
  };
}
