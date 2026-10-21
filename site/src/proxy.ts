import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale } from "@/i18n/config";

// English is served without a prefix: /about is rewritten to /en/about internally.
// The reverse redirect (/en/about -> /about) lives in next.config.ts.
// Original static pages (served from /public by next.config rewrites), never localised.
const STATIC_PAGES = ["/brand-guide", "/brand-guide/assets", "/decks/tvrtko-agents", "/v/reel-38bf03"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (STATIC_PAGES.includes(pathname)) return;
  if (pathname === "/hr" || pathname.startsWith("/hr/")) return;
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const headers = new Headers(request.headers);
  headers.set("x-lv-rewrite", "1");
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
