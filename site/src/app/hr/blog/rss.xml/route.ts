import { feed } from "@/lib/feed";

// /hr/blog/rss.xml: the Croatian feed.
export const GET = () => feed("hr");
