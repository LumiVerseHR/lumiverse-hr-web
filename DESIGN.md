---
name: LumiVerse
description: A founder-led AI product studio shown as a scale model under gallery light.
colors:
  coral: "#ff4d4d"
  coral-press: "#c42b2b"
  action: "#e03131"
  gallery: "#0e0f12"
  thesis-band: "#0b0c0e"
  footer-ground: "#0a0a0c"
  placard-black: "#0b0b0c"
  moulding: "#0a0a0b"
  mat: "#1d1c1a"
  frame-ground: "#111116"
  field: "#141417"
  field-focus: "#18181b"
  code-ground: "#16161a"
  text: "#f7f7f6"
  text-prose: "#d8d6d2"
  text-soft: "#cacaca"
  text-muted: "#8f8e8b"
  text-placeholder: "#6f6e6b"
  error: "#ff8a8a"
  basswood: "#c9a57a"
  white-card: "#edebe7"
  lamplight: "#ffd2a6"
  plinth-stone: "#0d0c0b"
  scene-floor: "#6a5240"
  scene-wall: "#1e1b18"
  hairline-rule: "rgb(255 255 255 / 0.12)"
  hairline-row: "rgb(255 255 255 / 0.08)"
typography:
  display:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(52px, 7.8vw, 132px)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.04em"
  page-title:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 116px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.2vw, 84px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline-inner:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.2vw, 64px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  stat:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(44px, 4vw, 64px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  title:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(24px, 1.9vw, 30px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.25vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  prose:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Golos Text, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.14em"
  placard-title:
    fontFamily: "Barlow Condensed, Golos Text, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    letterSpacing: "0.04em"
  caption:
    fontFamily: "Barlow Condensed, Golos Text, sans-serif"
    fontSize: "17px"
    fontWeight: 500
rounded:
  none: "0px"
  round: "50%"
spacing:
  gutter: "clamp(16px, 2.6vw, 40px)"
  section: "clamp(96px, 11vw, 184px)"
  section-inner: "clamp(80px, 9vw, 144px)"
  head-gap: "clamp(48px, 5.5vw, 88px)"
  block-gap: "clamp(32px, 3.5vw, 56px)"
  placard-pad: "28px"
  row-pad: "26px"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "15px 28px"
  button-primary-hover:
    backgroundColor: "{colors.coral-press}"
  button-primary-compact:
    backgroundColor: "{colors.coral}"
    textColor: "#ffffff"
    padding: "8px 12px"
  button-outline:
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "13px 16px"
  button-outline-hover:
    textColor: "{colors.coral}"
  placard:
    backgroundColor: "{colors.placard-black}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "28px"
  plinth-placard:
    backgroundColor: "{colors.placard-black}"
    textColor: "{colors.text}"
    typography: "{typography.placard-title}"
    padding: "10px 16px 12px"
  exhibit-frame:
    backgroundColor: "{colors.frame-ground}"
    rounded: "{rounded.none}"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "13px 14px"
  input-field-focus:
    backgroundColor: "{colors.field-focus}"
  list-row:
    textColor: "{colors.text}"
    padding: "26px 0"
---

# Design System: LumiVerse

## Overview

**Creative North Star: "The Scale Model Gallery"**

Every shipped project is a white scale model standing on one plinth in a dark gallery, under a single warm raking spotlight. The site is that room. The walls are near-black (gallery), the light is warm (lamplight, used only as a soft wash from above), and the models are white card and basswood. Tiny coral human figures stand among the models: they are the people each project amplifies, and coral belongs to them, to the LV logo symbol and its dot, and to the action the visitor should take next.

The homepage hero is a laser-cut exhibit on a plinth (`site/src/components/hero/`; replaced the earlier real-time 3D maquette). A coral beam leaves the logo dot, traces a device in gold, cuts it solid with a real product on its screen, holds it under the lamp with a black placard, and moves on to the next device. The plinth, devices and figures are pre-rendered layers; the browser only animates the reveal. Everything below the hero borrows from that room. Screenshots hang as framed prints. Labels and offers sit on black placards. Lists are wall labels divided by hairlines instead of boxed cards. Headlines are heavy white grotesk set at monumental scale with tight tracking. Density is low and the rhythm generous: sections breathe at up to 184px, and the copy rarely runs past 60–68ch.

The world refuses the AI-agency default: a dark field with neon glow, a bento grid, glass cards and gradient text. It also refuses showreel-over-video. MOTION.md, style-guide.md and the visual parts of writing-guide.md at the repo root describe the **previous** world (Inter, coral gradient text, glassmorphic cards, a dot-grid shader, a cyan secondary). That world has been replaced, and those files do not govern v3 visuals. Voice and copy rules in writing-guide.md still apply: active voice, specific numbers, no fluff, action-led CTAs, and its word-choice and sentence-length guidance. Two of its sections do not carry over: "Section Labels" (small uppercase labels above headlines) and the hero rule that the "middle word gets gradient treatment".

**Key Characteristics:**
- One dark room with one warm light. All atmosphere comes from a lamplight wash from above.
- Coral marks the human figures, the logo symbol and dot, and actions, and nothing decorative.
- Black placards are the labelling device, with a condensed italic caption face for their titles.
- Screenshots are always framed exhibits: a black moulding, a dark mat and a warm top bounce.
- Hairline-divided lists, not card boxes.
- Square corners everywhere. Only the logo dot and avatars are round.
- Heavy white grotesk headlines with negative tracking and leading under 1.

## Colors

The palette is a near-black gallery with three warm material colours from the model (white card, basswood and lamplight) and a single saturated coral.

### Primary
- **Figure Coral** (coral): the scale figures on the hero plinth, the laser beam, and the inline SVG `Figure` (the thesis line, case-study pull quotes, the 404 plinth), the LV logo symbol and dot, and every primary action fill. Coral is also the system's interaction signal: link and title hover colour, the 2px focus ring, text selection, the active showcase indicator, and the border of an invalid or focused form field.
- **Pressed Coral** (coral-press): the hover and pressed state of every coral fill. Nothing else uses it.

### Secondary
- **Basswood** (basswood): the model's wood, used in the interface as quiet ornament. It draws the 10–12px hairline dashes that start included-item lists, the italic step numbers and package tags, blog tags and language notes, the FAQ +/– marks, the blockquote rule, the avatar initials and the 404 plinth top. Never use it for a fill larger than a plinth strip, and never for an action.
- **Lamplight** (lamplight): the spotlight colour (`#ffd2a6` in the scene). In CSS it appears only as low-alpha radial wall-washes from above (`rgb(255 210 166 / 0.06–0.16)`), as the warm top bounce on framed exhibits, and as the active-row wash in the work index.

### Tertiary
- **White Card** (white-card): the models' material, which lives in the rendered hero layers and nowhere in the CSS. It is reserved for the models themselves. Interface surfaces are never white.

### Neutral
- **Gallery Wall** (gallery): the page background, the 3D canvas clear colour, and the base of the mobile menu panel.
- **Thesis Band** (thesis-band) and **Footer Ground** (footer-ground): one step darker than the wall, for the thesis band and the footer.
- **Placard Black** (placard-black): every placard, including plinth labels, package cards, landing doors, the contact form, case-study stat bands, plans, the consent bar and code blocks.
- **Moulding** (moulding), **Mat** (mat) and **Frame Ground** (frame-ground): the three layers of a framed exhibit.
- **Field** (field), **Field Focus** (field-focus) and **Code Ground** (code-ground): form inputs and inline code.
- **Text** (text) for headings and active values. **Text Prose** (text-prose) for long-form paragraphs. **Text Soft** (text-soft) for ledes and descriptions. **Text Muted** (text-muted) for metadata, crumbs and labels. **Text Placeholder** (text-placeholder) for inputs only.
- **Error** (error): form error text only.
- **Hairlines:** rules at `hairline-rule` (the top edge of a list), rows at `hairline-row`, and chrome edges at `rgb(255 255 255 / 0.06)`.
- **Render-only:** Plinth Stone (plinth-stone), Scene Floor (scene-floor) and Scene Wall (scene-wall) belong to the rendered hero room, not to globals.css.

### Named Rules
**The Coral Is Human Rule.** Coral fills only the human figures, the logo symbol and dot, and actions, and it colours only interaction states (hover, focus, selection, current). It never appears in a gradient, a glow, a background wash, a border ornament or an illustration other than the figures.

**The One Warm Light Rule.** All atmosphere is one warm light from above: radial washes of lamplight at 0.16 alpha or less, anchored at the top edge. Coloured glows, neon and cool light in the interface are out. The scene's single cool fill (`#9aa6c8` at 0.5) is a bounce panel inside the 3D environment only.

## Typography

**Display Font:** Golos Text 400/500/700 (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Golos Text
**Label/Caption Font:** Barlow Condensed italic 500/600 (with Golos Text, sans-serif)

**Character:** A heavy, slightly humanist grotesk carries everything at monumental scale with tight tracking. A condensed italic plays the museum-label hand beside it, used small and only where something is being labelled.

### Hierarchy
- **Display** (700, clamp(52px, 7.8vw, 132px), 0.82): the hero's three stacked lines ("Human / Imagination. / AI Speed.", cycling the middle word through Judgement. and Taste.). The thesis statement uses the same voice at clamp(48px, 8vw, 136px) / 0.92, with its muted line in text-muted.
- **Page Title** (700, clamp(48px, 7vw, 116px), 0.92, max 14–16ch): case-study, pricing, landing and blog index titles. The 404 code goes larger and muted (clamp(96px, 16vw, 240px)).
- **Headline** (700, clamp(40px, 5.2vw, 84px), 0.95, max 18ch, balanced): homepage section titles. Inner pages step down to **Headline Inner** (700, clamp(34px, 4.2vw, 64px), 0.98, max 20ch).
- **Stat** (700, clamp(44px, 4vw, 64px), 1, tabular): the numbers that prove a case. Stat bands and prices use clamp(36px, 3.6vw, 56px) and clamp(36px, 3vw, 44px).
- **Title** (600–700, 20–30px, −0.01 to −0.02em): exhibit names, offers, list-row names (clamp(19px, 1.5vw, 23px), 600), card and step headings (20px, 600).
- **Lede** (400, clamp(17px, 1.25vw, 20px), 1.5, max 54–60ch, text-soft): the paragraph under a headline.
- **Body** (400, 15–16px, 1.45–1.6): descriptions and list items. **Prose** (18px, 1.7, 68ch column, text-prose) is for blog posts and case-study text blocks.
- **Label** (600, 12px, 0.14em, uppercase, text-muted): data labels only, such as contact detail terms, footer column titles and table header cells (0.10–0.12em there).
- **Placard Title** (Barlow Condensed italic 600, 19px, 0.04em, uppercase): project names on the plinth placards.
- **Caption** (Barlow Condensed italic 500–600, 15–20px): placard captions, step numbers ("01"), package tags, card metadata, blog tags and language notes. Usually basswood or text-soft.

### Named Rules
**The Monumental Grotesk Rule.** Headlines are Golos Text 700 with negative tracking (−0.03 to −0.04em) and leading under 1. Light or regular weights never set a headline.

**The Caption Face Rule.** Barlow Condensed italic labels things: placards, sequence numbers, tags and metadata. It never sets a headline, body copy or a button.

## Layout

Content sits in a 1440px container with a fluid gutter (clamp(16px, 2.6vw, 40px)). Homepage sections are padded clamp(96px, 11vw, 184px) top and bottom, and inner-page sections clamp(80px, 9vw, 144px) on top. There is more space above a heading than below it: a section head is followed by clamp(48px, 5.5vw, 88px) and an inner-page head by clamp(32px, 3.5vw, 56px).

The hero is full-viewport (100svh). On landscape screens the copy holds the left third and the 3D plinth the right two thirds. On portrait screens (max-aspect-ratio 1/1) the copy takes the top and the model gets its own 56svh band below, masked in from transparent. The hero fades into the next section through a 140px gradient to gallery.

Grids are asymmetric two-column splits (1.15fr/1fr, 1.2fr/1fr, 1fr/1.1fr) with clamp gaps from 32 to 112px, or three equal columns for exhibits, offers and notes. Everything collapses to one column at 960px. The header swaps its nav and CTA for the mobile menu at 900px, and rows restack at 640 and 560px. Reading measure is 54–68ch.

## Elevation & Depth

Depth is physical, not tonal. Objects in the room (frames and placards) cast long, soft, dark shadows, as if lit from above, and framed exhibits pick up a faint warm bounce on their top edge. Flat page regions get no shadow. Hairlines separate them instead.

### Shadow Vocabulary
- **Exhibit frame** (`box-shadow: inset 0 0 0 6px #1d1c1a, 0 34px 70px rgb(0 0 0 / 0.65), 0 -14px 40px -18px rgb(255 214 170 / 0.32)`): homepage flagship frames. The hover state deepens to `0 46px 90px / 0.7` and a 0.42 bounce. Case-study showcases use `0 50px 120px` with a 0.3 bounce.
- **Small frame** (`box-shadow: inset 0 0 0 5px #1d1c1a, 0 30px 70px rgb(0 0 0 / 0.6), 0 -14px 40px -18px rgb(255 214 170 / 0.3)`): landing exhibits. In-body case images drop the bounce.
- **Plinth placard** (`box-shadow: 0 6px 18px rgb(0 0 0 / 0.55)`): the 3D placards.
- **Lit placard** (`box-shadow: 0 30px 80px rgb(0 0 0 / 0.55)`): the contact form.
- **Resting placard** (`box-shadow: 0 24px 60px rgb(0 0 0 / 0.45)`): package cards. Doors use `0 10px 30px rgb(0 0 0 / 0.4)`, and the consent bar uses `0 20px 60px rgb(0 0 0 / 0.6)`.

### Named Rules
**The Lit From Above Rule.** Every cast shadow falls downward (positive y, blur at least 18px), and any warm light sits on the top edge. Coloured or upward shadows are not used.

## Shapes

Every surface has square corners (0): buttons, placards, frames, inputs (explicitly `border-radius: 0`) and showcase indicators (28×4px bars). Circles are kept for things that are round in the room: the coral logo dot (0.34em) and the 44px byline avatar. The scale figure is drawn from rounded rects, which comes from the figure itself rather than from the system. Lines are 1px hairlines. Basswood dashes run 10–12px by 1px. Icons share one stroke family: 1.6px, round caps, on a 20px grid.

## Components

### Buttons
Coral and solid, square at every size.
- **Shape:** square corners (0).
- **Primary:** coral fill with white text at 500 weight and 16px, padded 15px 28px. It carries an optional 16px arrow icon with an 8px gap. Contact submit uses 16px 28px, and the mobile-menu CTA uses 18px 28px at 18px.
- **Compact primary:** the header's Start a Project uses 8px 12px at 13px, square like every other control.
- **Hover / Focus:** fill shifts to coral-press over 160ms ease-out, and submit presses down 1px. Focus is the global 2px coral outline at a 4px offset.
- **Outline:** a 1px `rgb(255 255 255 / 0.18)` border, transparent fill, 13px 16px. On hover the border and text turn coral. Consent uses the same pattern at 10px 16px, with a 0.16 border.
- **Text link:** underlined at a 0.3em offset with a 1px thickness, and coral on hover. The arrow link drops the underline and widens its gap from 8px to 12px on hover.

### Cards / Containers (Placards)
- **Corner Style:** square (0).
- **Background:** placard-black.
- **Shadow Strategy:** resting or lit placard (see Elevation & Depth).
- **Border:** none. An internal hairline (`rgb(255 255 255 / 0.1)`) may separate an included-items list.
- **Internal Padding:** 28px for packages and plans, 22px 24px for doors, clamp(24px, 3vw, 44px) for the form.
- **Hover:** doors lift 3px over 240ms cubic-bezier(0.22, 1, 0.36, 1) and their text turns coral.

### Inputs / Fields
- **Style:** a 1px `rgb(255 255 255 / 0.12)` border on a field background, 0 radius, 13px 14px padding, 16px text. Labels are 14px, 500. Optional hints are text-muted with no italics.
- **Hover:** the border rises to 0.22.
- **Focus:** a coral border on the field-focus ground, with no outline.
- **Error:** a coral border via `aria-invalid`, with the message in the error colour.

### Navigation
The header is a three-column grid: the logo lockup (`Logo`: the generated LV symbol on the text baseline, the name in Golos 500 at clamp(21px, 1.8vw, 28px), and the coral dot that is the laser origin) on the left, nav (15px, 500, clamp(28px, 3.2vw, 50px) gaps) in the centre, and EN/HR (14px, text-muted, current in text) with the compact CTA on the right. Over the hero it is transparent. On inner pages it sticks to the top on `rgb(14 15 18 / 0.86)` with a 12px backdrop blur and a 0.06 bottom hairline. Links turn coral on hover. Below 900px a Menu toggle opens a full-screen panel on gallery under a lamplight wash, with links at clamp(36px, 10vw, 52px) 700. It reveals over 280ms and respects reduced motion.

### Framed Exhibit (signature)
Real screenshots always hang as framed prints: a 14px moulding border (12px on smaller exhibits, 10px for the work-index preview, 8px for related thumbnails), a 6px inset mat, the frame ground, a 1px `rgb(255 255 255 / 0.07)` outline and the exhibit shadow. Homepage frames are 16/10 and landing frames 1200/630. On hover a frame lifts 5–6px over 320ms cubic-bezier(0.22, 1, 0.36, 1). A wall label beneath the frame holds the name, kind (text-muted), stat and summary. On the homepage each exhibit hangs in its own lamplight pool.

### Hairline List (signature)
Lists of work, offers, steps, posts, FAQs and products are wall labels divided by hairlines. A `hairline-rule` runs across the top of the list, with `hairline-row` between rows (rows padded 20–32px vertically). In the work index the active row slides its contents 12px over 260ms and picks up a lamplight wash (`linear-gradient(90deg, rgb(255 210 166 / 0.06), transparent 70%)`) while a sticky framed preview crossfades. Included items start with a basswood dash, not a bullet or a check icon.

### Plinth Placard (signature)
A black museum label on the 3D plinth front: min-width 210px, padded 10px 16px 12px. It carries an uppercase Placard Title and a 15px italic caption in text-soft, under the plinth-placard shadow.

### Laser Hero (signature)
The hero (`site/src/components/hero/HeroLaser.tsx`) is one cycle per device: four beams from the logo dot trace the device's real edges in gold (1.15s), a cut line sweeps down and reveals the solid render (0.85s), it holds under the lamp with its placard (4.8s), then vanishes (0.52s) and the next device begins (a laptop with Moj Kolega, a monitor with Titlomat, a curved workstation with Bridj). Lamplight cones fall from the logo dot on a 9.3s loop, with dust in the beams; `LampOrigin` measures the dot so the cone always starts there. Layers are responsive WebP (800/1100/1600w), the stage image loads first, and the stage holds its final solid frame under reduced motion. MOTION.md carries the same timings for video work.

## Do's and Don'ts

### Do:
- **Do** put every real screenshot in a framed exhibit (moulding, mat, warm top bounce). Never show it as a bare image.
- **Do** use placard-black placards for labels, offers, forms and stat bands, with square corners and a downward shadow.
- **Do** divide lists with hairlines (`hairline-rule` on top, `hairline-row` between rows) and start included items with a 10–12px basswood dash.
- **Do** set headlines in Golos Text 700 with −0.03 to −0.04em tracking and leading of 0.82–0.98.
- **Do** keep coral to the figures, the logo symbol and dot, action fills and interaction states, with coral-press for hover.
- **Do** light sections only with lamplight radial washes from the top edge at 0.16 alpha or less.
- **Do** use 160ms ease-out for colour changes and cubic-bezier(0.22, 1, 0.36, 1) at 240–320ms for lifts and reveals, and honour `prefers-reduced-motion`.

### Don't:
- **Don't** put an eyebrow or kicker (a small uppercase or italic category line) above a headline. The writing-guide's "Section Labels" pattern belongs to the previous world.
- **Don't** use gradient text, glassmorphic cards, neon or coloured glows, bento grids or the dot-grid shader from the legacy style-guide.md and MOTION.md.
- **Don't** round corners on buttons, placards, frames or inputs.
- **Don't** box list items into individual cards when a hairline list will do.
- **Don't** use coral for decoration, backgrounds, gradients or illustration other than the human figures.
- **Don't** use white card or basswood as large interface fills. They are model materials, and basswood appears in the interface only as small ornament.
- **Don't** use glowing brains, robots or circuit-board imagery.
