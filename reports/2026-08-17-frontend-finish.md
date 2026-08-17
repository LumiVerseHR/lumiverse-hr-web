# Frontend-finish pass — www.lumiverse.hr

Run 2026-08-17 (frontend-finish loop). All probes against served production
HTML; deploys via Vercel on push to `main`. Commits `cd3ce7c`, `ecdb054`.

## Deferred (next run starts here — mobile perf needs a dedicated session)

Mobile: Perf ~60, **FCP ~4.8s, LCP ~10s** (desktop is 96/1.2s — the problem
is the throttled-mobile critical chain, not the pages themselves).
Evidence from the PSI render-blocking audit:

| Blocker | Cost | Fix shape |
|---|---|---|
| Font Awesome CSS from cdnjs | **1,060 ms render-block** | Async-load (`media="print" onload`) or replace the handful of icons with inline SVG — the site uses a fraction of FA |
| Google Fonts CSS | 751 ms render-block | Async-load same way, or self-host the 2–3 Inter weights actually used (900/800/400) |
| styles.css | 191 ms | Fine; optionally inline critical hero rules |
| Portfolio JPEGs 200–275 KB each | image weight | Convert to WebP/AVIF, add `loading="lazy"` below the fold |

My 3-iteration cap was spent before the render-blocking audit was consulted —
lesson for the skill: **pull `render-blocking-resources` in iteration 1**, not
after element-level theories. (Applied this run's fixes anyway — see below —
both are keepers.)

Also deferred: a11y 92 (contrast/labels — PSI lists selectors), TTI ~10s
(follows from the same chain).

## Fixed this run

- **Preconnect** to `fonts.googleapis.com` + `fonts.gstatic.com` on all 16
  pages (was absent; strictly beneficial).
- **`font-display: optional`** (was `swap`) — the 10rem Inter-800 hero h1 no
  longer re-fires LCP with a late font-swap repaint; slow first visits keep
  the styled system fallback, repeat visits get cached Inter. Revert to
  `swap` if the brand font must show on first paint regardless of cost.

## Verified healthy, no action needed

Icons complete (ico/svg/192/512/apple + linked manifest + theme-color) ·
full OG/Twitter cards with real 1200×630 images, per-page canonicals and
unique titles (spot-checked subpages) · JSON-LD present · robots.txt with
sitemap ref · sitemap (17 URLs) · real 404 · 308 http/apex→https-www ·
© 2026 · no placeholder text · no mixed content · no horizontal scroll at
390×844 · Best-Practices + SEO **100/100** both strategies · IndexNow
script in place. No blog/news section → RSS n/a.
