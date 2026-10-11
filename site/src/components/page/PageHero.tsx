import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { jsonLdHtml } from "@/lib/jsonld";
import { seo } from "@/lib/seo";
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
  parent,
  children,
}: {
  lang: Locale;
  path: string;
  home: string;
  label: string;
  title: string;
  intro?: string;
  parent?: { label: string; path: string };
  children?: ReactNode;
}) {
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: home, item: `${SITE}${localePath(lang)}` },
      ...(parent ? [{ name: parent.label, item: `${SITE}${localePath(lang, parent.path)}` }] : []),
      { name: label, item: `${SITE}${localePath(lang, path)}` },
    ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  };
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(crumbs)} />
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <a href={localePath(lang)}>{home}</a>
        <span aria-hidden>/</span>
        {parent && (
          <>
            <a href={localePath(lang, parent.path)}>{parent.label}</a>
            <span aria-hidden>/</span>
          </>
        )}
        <span aria-current="page">{label}</span>
      </nav>
      <h1 id="page-title" className={styles.title}>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </section>
  );
}

// Title, description and both language URLs for an inner page.
export function pageMetadata(lang: Locale, path: string, title: string, description: string, image?: string): Metadata {
  return seo({ lang, path, title, description, image });
}
