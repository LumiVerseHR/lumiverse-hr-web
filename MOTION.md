# MOTION.md — LumiVerse

Read this in full before designing, generating or animating anything for LumiVerse.
It sets the **look**, not the ambition: when asked to go all out, go all out, inside these rules.
Anything not covered here is marked **ASK ME** — ask, don't choose.

Sources, in order of authority: the live v3 site (`site/`, deployed 2026-10-11), its tokens in
`site/src/app/globals.css`, the homepage laser hero (`site/src/components/hero/`), and DESIGN.md
("The Scale Model Gallery"). DESIGN.md governs interface components; this file governs motion,
video, stills and generated imagery, so both agree on colour, type and light.

**Retired look — never revert to it:** Inter, the `#050508` canvas, the coral → orange → gold
gradient text, glassmorphic cards, the cyan secondary and the dot-grid wave shader. That was the
pre-v3 site and the September 2026 launch video. The slogan "We build Better Humans" is retired too.

---

## 1. Colour

One dark room, one warm light, white card and basswood models, and coral for people and actions.

| Value | Role |
|---|---|
| `#0e0f12` | **Gallery wall.** Every frame starts and ends here. Dips between scenes go through it. |
| `#0b0c0e` / `#0a0a0c` | One step darker: the thesis band and the footer. |
| `#0b0b0c` | **Placard black.** Labels, offers, stat bands, captions on screen. |
| `#0a0a0b` + `#1d1c1a` + `#111116` | Moulding, mat and ground of a **framed exhibit** (screenshots). |
| `#ff4d4d` | **Coral.** The human figures, the LV logo symbol and its dot, the laser beam, and the action. Nothing decorative. |
| `#e03131` | Coral for a button with a white label (passes WCAG AA). `#c42b2b` when pressed. |
| `#c9a57a` | **Basswood.** The models' wood. In graphics: hairline dashes, step numbers, small tags, our-model highlight in charts. Never a large fill. |
| `#ffd2a6` | **Lamplight.** The only atmosphere: low-alpha washes and cones from above (`rgb(255 210 166 / 0.06–0.16)`, beams up to ~0.36 at the core). |
| gold `rgb(255 214 140)` | The laser's burn: the wireframe it leaves and the hot glow on fresh edges. Only inside a laser reveal. |
| `#edebe7` | **White card.** The models themselves. Never an interface surface. |
| `#f7f7f6` | Primary text. |
| `#cacaca` | Secondary text: ledes, captions. |
| `#8f8e8b` | Muted labels and metadata; never for anything the viewer must read on video. |
| `rgb(255 255 255 / 0.12)` / `0.08` | Hairline rules and rows. |

- **No gradients on type**, no coloured glows, no neon, no cool light in the interface. The only
  "gradient" is lamplight falling off from above.
- **Coral is human.** A coral fill is a figure, the logo symbol or dot, the beam or the button. Never a
  background, a wash, a border ornament or an illustration.
- **Brightness budget:** dark-first. Content glows only where the lamp hits it.

## 2. Type

- **Golos Text** 400/500/700 for everything that is read: headlines, body, numbers, buttons.
- **Barlow Condensed italic** 500/600 only for labelling: placards, step numbers ("01"), tags,
  captions. Never a headline, body copy or a button.
- Load both before the first frame is captured. No third family.
- On the site (DESIGN.md has the full scale): display `clamp(52px, 7.8vw, 132px)`, 700,
  line-height 0.82–0.95, tracking −0.04em; section headlines `clamp(40px, 5.2vw, 84px)`;
  stats 700 with tabular figures; ledes 17–20px, 400, `#cacaca`.
- At 1920×1080 video, scale the same voice up:
  - Hook / statement: 150–180px, 700, line-height 0.9, −0.04em.
  - Scene titles: 64–84px, 700, −0.03em.
  - Big numbers: 160–190px, 700, −0.04em, white (not gradient); unit beside it at ~44px, 500, `#cacaca`.
  - Captions: ~34px, 400–500, `#cacaca`.
  - Labels: Barlow Condensed italic 600, 28–34px, basswood or `#cacaca`. No uppercase pill tags.
- No eyebrows or kickers above a headline (the old "section label" pattern is retired).
- Vertical (1080×1920) and square scale: **ASK ME** (none shipped yet).
- Copy rules come from `writing-guide.md`: active, specific, numbers over adjectives, 3–7 word
  headlines. British English. Croatian addresses the reader with a capitalised "Vi".

## 3. Timing

**On the site** (the reference for every UI motion):
- Colour and hover changes: 160ms ease-out.
- Lifts and reveals: 240–320ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Frames lift 5–6px, doors 3px.
- Mobile menu: 280ms reveal.
- **The laser hero cycle:** trace 1.15s → cut 0.85s → hold 4.8s → vanish 0.52s, then the next
  device. Lamplight cones drift on a 9.3s loop.
- Every animation respects `prefers-reduced-motion`: the final state, still.

**In video:**
- 30 fps. Launch pieces 15–25s; 18–22s is the target.
- Music-first grid: 120 BPM, one bar = 2s. Every cut lands on a beat; scenes are whole or half bars.
- In: 0.4–0.5s. Headlines rise out of a clip mask (translateY 105% → 0); supporting elements
  stagger 70ms apart.
- Hold: anything meant to be read stays settled for at least 0.3s per word after the line is in.
- Out: 0.25–0.3s, faster than the in. The old scene leaves before the new one arrives; no
  crossfade of two busy layouts.
- Grids and lists build one item at a time, ~125ms apart.

## 4. Movement

- Easing: in = `cubic-bezier(0.22, 1, 0.36, 1)` (or ease-out quint); out = ease-in cubic;
  lighting changes = ease-in-out cubic. Linear only for counters, slow drift and the laser trace.
- Distances are small and confident: 20–60px for text, up to 240px for a framed screenshot
  sliding in, settling flat.
- Life in held shots: a slow push-in on stills (scale +6% across the scene), counters counting
  up, dust drifting in the lamp cones.
- **Signature motion: the laser cut.** A coral beam leaves the logo dot, splits, and traces the
  object's real edges in gold; a second sweep cuts it into the finished thing; it holds under the
  lamp, then dissolves. Reuse the hero's renders and timing (`site/src/components/hero/`) rather
  than imitating it.
- **Signature setting: the gallery.** A plinth in a dark room under one warm raking light, with
  tiny coral figures for scale. Never a generic gradient blob or particle field.
- Handmade feel: **ASK ME**. So far the motion has been precise, with no jitter or boiling lines.

## 5. Texture and finish

- **Framed exhibits:** real screenshots always hang as framed prints: a 14px black moulding, a
  6px dark mat, a 1px `rgb(255 255 255 / 0.07)` outline, a long soft shadow below
  (`0 34px 70px rgb(0 0 0 / 0.65)`) and a faint warm bounce on the top edge. Native aspect ratio,
  nothing cropped. A browser bar (three dots, real domain) only for screen recordings.
- **Placards:** black, square corners, a downward shadow, a Barlow Condensed italic title.
- **Square corners everywhere.** Only the logo dot and avatars are round.
- **Lit from above:** every shadow falls downward, every warm highlight sits on a top edge.
- Readability overlays: a bottom-up `#0e0f12` gradient behind text on an image.
- Charts and diagrams: gallery-dark ground, Golos Text labels, white and `#cacaca` for data,
  basswood for the series that is ours, hairline gridlines. No coral in charts.
- Film grain, chromatic aberration, bloom outside the laser: none so far. **ASK ME** before adding any.
- Sound: an original soundtrack in one key (so far A minor, 120 BPM); effects share its key and
  reverb and sit under the music. Voiceover: **ASK ME**.

## 6. Never

1. **The retired look:** Inter, gradient text, glass cards, the dot-grid shader, cyan, `#050508`.
2. **Generic AI-SaaS:** purple gradients, glowing brains, circuit boards, stock robots, neon,
   bento grids, or "streamline your workflow" copy.
3. **Invented claims:** no number, testimonial or logo that isn't in the repo or on a live case study.
4. **Muddy crossfades** of two busy layouts, or text that leaves before it can be read.
5. **Coral as decoration,** or more than one accent fighting in a shot.
6. **Fake UI:** no hand-drawn buttons or cards when the real screenshot, component or CSS exists.
   Real components are structural donors, restyled to this file.

## 7. Done right — the reference

**The homepage hero (live since 2026-10-11)** is the reference for "done right":
1. Dark gallery, the LumiVerse lockup (coral LV symbol, Golos 500 name, coral dot), one warm lamp cone falling from the dot.
2. The cycling headline in Golos Text 700: "Human / Imagination. / AI Speed.", then "Judgement.",
   then "Taste." in the middle line. The lede in `#cacaca` ("AI product studio in Zagreb. Ambitious
   products, shipped and checked.") and one coral "Start a Project" button.
3. On the plinth, a beam traces a device (laptop, monitor, curved workstation) in gold in 1.15s,
   cuts it solid in 0.85s with a real product on its screen (Moj Kolega, Titlomat, Bridj), holds
   4.8s with a placard naming it, dissolves in 0.52s, and the next device begins.
4. Coral figures stand on the plinth for scale, grounded by soft shadows that fall toward the rim.

The September 2026 launch video (kept outside the repo) is still the reference for **video
pacing** (section 3), but not for its look: it uses the retired palette, gradient numbers, the
dot-grid background and the retired slogan. A new launch cut in the v3 look: **ASK ME**.
