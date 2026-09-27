# MOTION.md — LumiVerse

Read this in full before designing, generating or animating anything for LumiVerse.
It sets the **look**, not the ambition: when asked to go all out, go all out, inside these rules.
Anything not covered here is marked **ASK ME** — ask, don't choose.

Sources: `styles.css`, `style-guide.md`, the homepage hero shader (`index.html`), and the first
launch video (Sept 2026, kept outside the repo; section 7 describes it shot by shot), which is
the reference for "done right".

---

## 1. Colour

| Hex | Role |
|---|---|
| `#050508` | Canvas. Every frame starts and ends here. Dips between scenes go through it. |
| `#0c0c10` | Raised surface: cards, browser chrome, panels. |
| `#111116` | Highest surface, image placeholders. |
| `#FF4D4D` | Coral. The one accent. Key word, CTA, the live dot, active chip border. |
| `#FF8F4D` | Orange. Gradient midpoint only, never on its own as a fill. |
| `#FFD54D` | Gold. Gradient end only. |
| `#4DFFFF` | Cyan. Secondary, sparingly: the drifting band in the dot-grid, data highlights. Never competes with coral in one shot. |
| `#FAFAFA` | Primary text. |
| `#A0A0A8` / `#888888` | Secondary text: captions, subtitles. |
| `#555555` | Muted labels only; never for anything the viewer must read on video. |
| `rgba(255,255,255,0.03)` / `0.08` | Glass fill / glass border. |

- **Gradient:** `linear-gradient(135deg, #FF4D4D 0%, #FF8F4D 50%, #FFD54D 100%)`, on **one word or one line per shot**, clipped to text (the `.gradient-text` class).
- **Brightness budget:** dark-first. Background dims to ~25–30% under busy content (screenshots, card grids) and returns to full only on the hero/outro.

## 2. Type

- **Inter** only (400–900), loaded before the first frame is captured. No second family.
- Sizes at 1920×1080:
  - Hero / hook: 160–185px, weight 800, line-height 0.95–0.98, letter-spacing −0.04 to −0.045em.
  - Statement lines (thesis): ~144px, 800.
  - Big numbers: ~190px, 800, gradient, −0.05em; unit beside it at ~50px, 700, white.
  - Scene titles: 64–80px, 700–800, −0.03em.
  - Captions: ~34px, 500, secondary colour.
  - Labels / tags: 16–20px, 600, uppercase, +0.15em tracking, coral on a faint coral pill (`.project-tag`, `.section-label`).
- Vertical (1080×1920) and square scale: **ASK ME** (none shipped yet).
- Copy rules come from `writing-guide.md`: active, specific, numbers over adjectives, headlines 3–7 words.

## 3. Timing

- 30 fps. Launch pieces run 15–25s; 18–22s is the target.
- Music-first grid: 120 BPM, one bar = 2s. **Every cut lands on a beat**; scene lengths are whole bars or half-bars.
- **In:** 0.4–0.5s. Headlines rise out of a clip mask (translateY 105% → 0). Supporting elements stagger 70ms apart.
- **Hold:** anything meant to be read stays fully settled for at least 0.3s per word, counted from when the whole line is in.
- **Out:** 0.25–0.3s, faster than the in. The old scene leaves before the new one arrives (staggered); no overlapping crossfade of two busy layouts.
- Grids and lists build one item at a time, ~125ms apart.

## 4. Movement

- Easing: in = ease-out quint (`1 − (1−x)^5`) or cubic; out = ease-in cubic; background changes = ease-in-out cubic. No linear motion except counters and slow drift.
- Distances are small and confident: 20–60px for text, up to 240px for a screenshot sliding in with ≤2° rotation that settles to 0.
- Life in held shots: slow push-in on screenshots (scale +6% across the scene), counters counting up, chips popping in, the dot-grid always drifting underneath.
- Signature background: the homepage **dot-grid wave shader** (coral dots, drifting cyan band, rare blinking LEDs, faint diagonal sweep). Reuse it as-is and never swap it for a generic gradient blob.
- Handmade feel: **ASK ME**. So far the motion has been precise, with no jitter or boiling lines.

## 5. Texture and finish

- Glassmorphic cards: 16–20px radius, 1px `rgba(255,255,255,0.08–0.12)` border, deep soft shadow `0 40px 100px rgba(0,0,0,0.6)`.
- Screenshots sit in a dark browser frame (44px bar, three dots, real domain) at their **native aspect ratio**, so nothing is cropped.
- Readability overlays: bottom-up `#050508` gradient behind any text on an image.
- Film grain, glow, chromatic aberration: none so far. **ASK ME** before adding any.
- Sound: an original soundtrack in one key (so far A minor, 120 BPM). Effects share its key and reverb and sit under the music. Voiceover: **ASK ME**.

## 6. Never

1. **Generic AI-SaaS look:** purple gradients, glowing brains, circuit boards, stock robots, or "streamline your workflow" copy.
2. **Invented claims:** no number, testimonial or logo that isn't in the repo or on a live case study.
3. **Muddy crossfades** of two busy layouts, or text that leaves before it can be read.
4. **Accent overload:** more than one gradient word per shot, or coral and cyan fighting in the same shot.
5. **Fake UI:** no hand-drawn buttons or cards when the real screenshot, component or CSS exists. Real components are structural donors, restyled to this file.

## 7. Done right — shot by shot (launch video, 22s)

1. **0–3s Hook.** Dot-grid at full strength, dark on the left. Pill "AI Product Studio · Zagreb" fades up. "Small studio." rises out of its mask; 0.65s later "Unreasonable range." rises in the gradient. Held until 2.7s, then lifts 60px and fades. Soft sub drop, then a four-note shimmer.
2. **3–11s Highlights, one per bar.** The background dims to 28%. A real screenshot slides in from the side and settles; tag, name, big gradient number (counting up) and caption stagger in on the left. Chips (languages, domains) pop in along the screenshot's base. Kick and arpeggio enter; a whoosh sits on each cut.
3. **11–15s Wall.** "Humans, Amplified" and then 12 real case-study cards build one by one. Each card gets a pluck climbing the A-minor pentatonic.
4. **15–19s Thesis.** Drums drop out, a centred dark spotlight, "Generation is cheap." then "Judgement isn't." in the gradient. A filtered riser.
5. **19–22s Outro.** The homepage hero rebuilt: logo, pill, "We build / Better / Humans", subtitle, "Start a Project →" and lumiverse.hr. An impact on the downbeat; this frame is the poster.
