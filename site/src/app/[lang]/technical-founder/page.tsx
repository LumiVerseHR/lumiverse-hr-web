import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage, landingMetadata } from "@/components/landing/LandingPage";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/technical-founder">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? landingMetadata("technical-founder", lang) : {};
}

export default async function Page({ params }: PageProps<"/[lang]/technical-founder">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <LandingPage slug="technical-founder" lang={lang} dict={await getDictionary(lang)} />;
}
