# Blog backlog: mined from devlogs, reports and commits

2026-09-25 · source: `newsportal` (MOJ KRAJ.) + a sweep of the portfolio repos
Evidence is a commit hash or a file path in the named repo. **public** = already on the lumiverse.hr case study page. **internal** = not published yet.

## Devlog inventory

There's no single devlog habit across the studio. The raw material lives in dated `reports/` folders and in long commit messages.

| Portfolio item | Repo | What exists |
|---|---|---|
| MOJ KRAJ. | `newsportal` (331 commits, 2026-07-12 → 08-26) | No devlog. Commit messages are 20–60-line Croatian write-ups with measurements and root causes, so they work as a devlog. Also `CLAUDE.md` (decisions + reasons) and 6 dated reports/docs |
| Moj Kolega | `magentic-ai` (1,501 commits) | 54 dated reports incl. `reports/2026-08-21-devlog.md` |
| Overserved | `ai-tower-defense` (588 commits) | **Real devlog:** `devlog/<date-slug>/entry.md`, 21 entries + INDEX + template |
| Titlomat | `titlomat.com` (732) | ~20 reports, `stories/PHASE-0-BASELINE.md`, 7 LinkedIn drafts |
| Tvrtko / Pazi | `tvrtko-ai` (3,225) | 565 reports |
| Country Guides | `country-guides` (4,178) | 491 report files |
| Rentalica | `rentalica` (470) | 49 reports, many are private client letters |
| Lider Translations | `lider-translations` | 51 reports |
| Barcoder | `barcoder` (1,255) | 9 reports + tracking files |
| DreamState | `dreamstate` (2,801) | `diary.md` + `reports/ask-evals/JOURNAL.md` (221 entries) |
| Endless | `~/endless` | `diary.md` + 52 dated notes |
| Aimito / air-laser / Lider PDF / ARMY Adria | — | 0–2 reports, no devlog |

**Recommendation:** adopt Overserved's `devlog/<date-slug>/entry.md` template in active repos. Writing one entry per notable incident makes blog posts cheap to produce later.

## MOJ KRAJ. candidates (repo `newsportal`)

1. **A Judge That Mostly Agrees Is Not a Judge.** A 4B model was tested as a replacement for the 35B grounding judge.
   - On 20 articles the 35B had held back, the 4B pushed 15 over the publish line, some from 66 to 100. It also flipped 4 of 20 articles the 35B had passed. 9 of its first 20 scores were exactly 100. (935b108)
   - A test now reads the source code and fails if a judge ever uses the small model. (`test_fast_role.py`)
   - The 4B was kept for the kicker (the short topic label over a headline), where it takes 0.3–0.6s against 57–103s. (internal)
2. **8 Seconds to Write, 863 Seconds to Check.** Where the compute really goes.
   - Triage 2.6s, facts 1.0s, draft 4.5s, then grounding + bias 862.9s, and the article still failed. (815e5aa)
   - 476 of about 530 failures were grounding calls that spent their whole reasoning budget and returned nothing. (6d80df7)
   - The regression was self-inflicted: the grounding budget was raised from 6144 to 10240 tokens. (815e5aa) (internal)
3. **A Model Swap Silently Switched Off Our Verifier.** Under a server flag, `think=True` became a no-op without any error.
   - Reasoning was worth +52 median points on Qwen3.6 and +0 on Qwen3.8.
   - 3.8 was rolled back after one shift: 7 articles written, 0 published. (f0cf951, 343ca42, 9fc91da) (internal)
4. **Your Guardrail Is Dead and Looks Exactly Like a Pass.** Each check is fed "canary" text it must catch, and reports fired, silent or broken.
   - The same failure pattern turned up 5 times, including a cron job that failed 24 nights in a row.
   - The self-check's first production run hit a NameError while all 272 tests passed. (3fcf527, 81105f8) (internal; the "9 checks" claim is public)
5. **Every Number Was Right; One Word Was Wrong.** Failures that grounding can't see by design.
   - A law's €1,320–2,650 fine range was written as "prescribes €1,320". (a480e72)
   - Invented names scored 100 on grounding. A new screen flagged 10 of 60 articles, 8 of them real errors. (3351759)
   - The same earthquake was published 4 times with 4 different death tolls. (9b42b92) (internal, needs editorial sign-off)
6. **The About Page Promised Links. 0 of 1,101 Had Them.** Auditing the product against its own public promises.
   - 61% of articles showed an internal source code instead of a name. (5aa5438)
   - The fix looked right on the editorial server and was empty on the live site. The backfill was written in raw SQL so Google wouldn't see 1,101 articles change in the same second. (b5e7781) (internal)
7. **Why We Didn't Add German.** 93.2% of Croatian pages earn a click, against 28.7% of English ones. The limit was indexation, not GPU cost. (`CLAUDE.md` ~l.133–152, 419666d) (internal; partly contradicts the public "town front pages" story)

## Other portfolio candidates

8. **The Judge Failed Croatian, Not the Bot** (Moj Kolega). The eval judge read "nije dostupno" ("not available") as "available", so a correct answer failed 12/12.
   - After hardening the judge: 11/11 cases right, and a real miss still fails 6/6. (`reports/2026-08-24-eval-hardening-and-prod-scorecard.md`, 5aa039a4, 239079a9)
   - ⚠ The language detector covers only 5 languages, while the public page says 9.
9. **The Cheaper Model Won on Both Axes** (Moj Kolega). Setup: 18 questions × 2 runs × 5 models.
   - gpt-4o-mini: $0.79 per 1k answers, judge score 1.94. gpt-4.1-mini: $2.02, 1.92.
   - Pricing answers were wrong until the grounding tools returned prices. (`reports/2026-08-21-devlog.md` §3, dd01b21e)
10. **Prompts Can't Bind Small Models, So We Check Output** (Moj Kolega).
    - A unit-claim detector checks every figure against this turn's tool results. (34f8a287)
    - Cash on delivery went from about 0/4 to about 3/4 correct. (afb26a60)
    - A leak scanner stops answers mid-stream. (41ee2973)
11. **Whisper on Croatian: 1.85% to 12.48% WER** (Titlomat).
    - The 12.48% channel is driven by English mixed into Croatian speech. (322474d, `stories/PHASE-0-BASELINE.md`)
    - The dictionary-prompt fix was reverted (4ffdae2), and prod crash-looped after (4777c84). An LLM correction pass replaced it. (a3def5f) ⚠ Lider Lab audio is client content.
12. **The Blog Post That Killed Our Activation** (Titlomat). A post saying "the video doesn't have to be yours" brought signups that never connected a channel. (`reports/2026-07-24-signup-activation-gap.md`, 781cf6f, 48e52de)
13. **The Photo Auditor That Moved Šibenik** (Country Guides). 39 photo passes, 43 reverts. It caught the Kornati islands captioned as Šibenik and an invented "Venice, Notranjska". (9b8cc6e16, 7338ae240) (public)
14. **Grammar Ate the Parameter** (DreamState). The model "knew the right GID and physically could not emit it", because a Dict parameter compiled to an empty grammar schema. Material: 221 journal entries. ⚠ Scrub Bridj mentions.

## Needs sign-off: do not publish without it

- **Clients:** Lider (Pitaj Lider eval, Lider Lab audio), Rentalica (every audit figure is the client's money; the `email-igor-*` letters are private), Bridj (named in the DreamState journal).
- **MOJ KRAJ.:**
  - Never publish: server IP, deploy/tracking IDs, the sync token name, the WAF-bypass "stealth" scraper sidecar, Linker Media ad terms / consent-gate decision, HINA access terms, the AEM regulator filing.
  - Name no real people from incident commits.
  - The gpt-4.1-mini fallback contradicts any "fully local" framing.
- **Moj Kolega:** the demo shops may be real stores; check before naming them.
