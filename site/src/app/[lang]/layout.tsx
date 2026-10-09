import type { Metadata } from "next";
import { Barlow_Condensed, Golos_Text } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Script from "next/script";
import { Consent } from "@/components/chrome/Consent";
import { Footer } from "@/components/sections/Footer";
import "../globals.css";

const golos = Golos_Text({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-golos",
  display: "swap",
});

// The placard face: condensed italic captions, as on the plinth labels in the comp.
const caption = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-caption",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL("https://www.lumiverse.hr"),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { canonical: lang === "en" ? "/" : "/hr", languages: { en: "/", hr: "/hr" } },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} className={`${golos.variable} ${caption.variable}`}>
      <body>
        {children}
        <Footer lang={lang} dict={dict} />
        <Consent copy={dict.consent} />
        {/* Moj Kolega, our own AI employee, answers questions on every page. */}
        <Script
          src="https://widget.mojkolega.hr/embed.js"
          data-agent="demo-agent-www-lumiverse-hr-clwyqg"
          data-key="kol_114e846b83c8bafdce937764d1a004cb"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
