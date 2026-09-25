---
title: One Newsroom, Ten Languages, 1.4M Articles
description: How we translate a Croatian newsroom into ten languages every day - the English pivot, the cost per article, and the bug that duplicated a quarter of our rows.
date: 2026-09-24
tags: [Build Log, AI Translation]
related: [lider-translations]
image: /images/og/lider-translations.jpg
---

[Lider](https://hr.lider.media) publishes Croatian business news. The brief was simple to say and awkward to build: make the *whole* newsroom readable in ten more languages. Not a curated selection. The full print-and-web archive, plus every new story, every day, each language on its own real news site.

Today that's eleven live WordPress sites: the Croatian source plus English, German, French, Italian, Spanish, Russian, Turkish, Chinese, Japanese and Hungarian. Each translated site carries around 142,000 articles, about 1.4 million in total, and a daily job keeps them current.

Here's how it works, and where it went wrong.

## Don't translate Croatian ten times

The obvious design is ten direct translations: Croatian to German, Croatian to Japanese, and so on. That's ten independent, expensive paths, and for a smaller source language the quality wobbles most on the rarer pairs. Getting Croatian to Japanese right is harder than getting English to Japanese right.

So English does the heavy lifting in the middle:

1. **Croatian → English**, once, carefully.
2. **English → the other nine**, from that clean English.

One good pivot instead of ten brittle direct pairs. Better output on the rare pairs, and each article only ever pays for one translation out of Croatian.

## Cheap by design

At this volume, the unit cost *is* the architecture. A few decisions carry most of it:

- **A small, fast model.** GPT-4o-mini handles the lot: title, subhead, body HTML, tags and category. Our planning figure was around $1.50 per thousand article translations, and a test run into German came in at about a quarter of a cent per article.
- **Structured output, validated.** Every response has to match the same schema the database is shaped by. Models occasionally return broken JSON, so there's a repair step before any retry. In one five-article test run, one response needed repairing and none needed a retry.
- **Fix the part that's wrong.** When only the tags need correcting, a tags-only pass re-runs for a fraction of the cost of retranslating the article.
- **Batch publishing.** Finished articles go to WordPress through a batch API, tens to hundreds a minute, instead of one request per post.

None of this is clever on its own. Together it's the difference between "translate a newsroom into ten languages, forever" being a budget line and being a background process.

## Eleven sites, not one site with a switcher

Every language runs its own WordPress install on its own subdomain (`en.lider.media`, `de.lider.media`, …). It's more to operate than a language plugin on a single site, but it buys two things:

- **Isolation.** One site's bad plugin update or traffic spike never becomes another's problem.
- **Real pages in every language.** Server-rendered, with their own sitemaps and Search Console. A search engine indexes the Japanese site as a Japanese news site, not as a client-side widget bolted onto a Croatian one.

Design lives in one place: the English install is the master theme, pushed to the other nine so the translated sites never drift into ten slightly different designs. (The Croatian source keeps its own magazine theme.) Images live once, on a small media server behind nginx, instead of being uploaded ten times.

## The bug that doubled a quarter of the rows

Now the part that doesn't make the case study.

The first version of the translation script picked its work with a query like this:

```sql
SELECT * FROM articles_hr
WHERE article_id NOT IN (
  SELECT article_id FROM articles_en WHERE article_id IS NOT NULL
)
```

"Give me every Croatian article that doesn't have an English row yet." It reads correctly.

In production it didn't hold. Our best explanation: with runs overlapping, the subquery didn't always see rows another run had just committed. The same article got picked up again, translated again, and inserted again. One article had five copies, all created in the same second.

By the time we audited it, there were **24,563 duplicate rows** across the ten language tables, about a quarter of the translated data. Every extra row had been through the model again.

The fix was dull and correct:

- **Check before you pay.** Right before calling the model, look up whether that exact article already exists in the target language. If it does, skip it. The check costs a database query. The mistake costs a translation.
- **Clean up with a dry run first.** A cleanup script that counts, shows what it would delete, keeps the newest copy, and only runs after typing `DELETE` to confirm.
- **Count skips in the run summary**, so a regression shows up as a number instead of a surprise.

The lesson isn't really about `NOT IN`. It's that the pipeline had a generator (the model) and a publisher (WordPress), and nothing in between whose job was to ask *"should this row exist?"*. Once that question had an owner, the problem stayed fixed.

## Where it is now

A daily job reads the day's new Croatian stories, fans them out to all ten languages, syncs the sites, clears caches and reports back. It's throttled to the newsroom's real publishing rate, so it never burns tokens on noise.

If you publish something that deserves a wider audience - news, a catalogue, documentation - the pattern transfers: pivot through one strong language, validate every response, make the unit cost boring, and give someone the job of saying no before you pay for the same thing twice.

[See the live sites and the full case study.](/lider-translations)
