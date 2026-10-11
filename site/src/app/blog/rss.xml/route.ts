import { feed } from "@/lib/feed";

// /blog/rss.xml: the English feed (same address as the legacy site).
export const GET = () => feed("en");
