# LumiVerse logo W2 — first-pass analysis

Source: `Dropbox/LumiVerse/Vizuali/LumiVerse-logo-W2/` (9 files, all dated 2026-10-21 14:01).
Nothing has been changed yet. This pass only investigates.

## 1. What's in the folder

| File | Content |
|---|---|
| `lumiverse-w2-symbol-{red,black,white}.svg` | LV symbol only, 3 polygons, 393 bytes each |
| `lumiverse-w2-logo-{light,dark,black,white}.svg` | Symbol + wordmark lockup, 89 KB each. light = red mark + black text, dark = red mark + white text |
| `preview.svg` / `preview.png` | Presentation board |

The files differ only in their fill colours. The folder has no stacked lockup, no favicon or app-icon
cuts, no PNG exports and no clear-space or minimum-size spec.

## 2. Wordmark: a raster trace, not type

- One `<path>` with 12 subpaths and **3,349 path commands**, every one a `Q` curve snapped to a
  0.5-unit grid. It was auto-traced from a bitmap.
- At zoom the edges are visibly lumpy: the foot of the L, the bowl of the u and the top of the u's
  right stem all wobble, and the corners are soft blobs rather than drawn radii.
- The typeface is **not Golos Text**, which the v3 site uses for its wordmark
  (`site/src/components/chrome/Header.tsx:41`). It looks like a generic rounded geometric sans.
- Each lockup file weighs 89 KB because of this. Clean outlines would be about 3–5 KB.

**Fix:** set "LumiVerse" in Golos Text from the real font file, adjust tracking and kerning by hand,
then convert to clean outlines with fontTools (4.62 is installed). Logo files must not depend on an
installed font, but the outlines will come from the true font this time.

Side note: the site header asks for `font-weight: 600` (`Header.module.css:32`), but only Golos
400/500/700 are loaded, so browsers actually render the wordmark at 700. We need to pick one weight
for the logo.

## 3. Symbol: clean vectors, uneven geometry

The polygons themselves are clean. The proportions are not systematic yet (units are the symbol's
own coordinates, 469 × 390):

| Issue | Measurement |
|---|---|
| Stroke widths differ | L stem 108, V left arm 89, V right arm 94 |
| V left arm tapers | outer edge slope 1.70 vs inner edge 1.90, so the edges aren't parallel |
| Gaps uneven | L stem↔V = 16; L foot↔V ≈ 18; right arm↔left arm tapers from 16 to 20 |
| Top alignment | L top at y=0, both V arms start at y=32 |
| Bottom overshoot | V point at y=390, L baseline at 374 (+16) |
| Corner cuts | 16-unit chamfer at the L's bottom-left; 55-unit vertical cut at the V's top-right. Two different systems |
| Notch / hook | `(213,261)(244,226)(251,238)(226,278)`. At 16–32 px it fills in and the mark reads as "Ly" or "L4" |

The top offset and the overshoot may be deliberate, but they should be rebuilt as a stated rule.
The plan is to redraw everything on one grid, with one gap unit (16) and one stroke width, so the
mark stays the same but its proportions follow rules.

The small-size test (16/24/32/64 px) confirms that the notch is the weakest detail. We will
probably need a simplified favicon cut with the notch closed or enlarged.

## 4. Colour doesn't match the brand tokens

| W2 files | v3 tokens (`site/src/app/globals.css`, MOTION.md) |
|---|---|
| red `#D64038` | coral `#ff4d4d`; `#e03131` for AA on white labels |
| black `#101113` | gallery wall `#0e0f12`; placard `#0b0b0c` |
| cream `#F6F4EF` (preview bg) | white card `#edebe7`; text `#f7f7f6` |

None of the W2 colours is a site token. MOTION.md also says that coral is used for people, the logo
dot, the beam and actions, and "nothing decorative". A fully coral symbol is a new use, so this rule
needs a decision from you.

## 5. Integration impact on the live site

- The v3 header wordmark is live text plus the coral **dot**, and that dot is the **laser origin**
  (`data-laser-origin`) for the hero's signature laser-cut motion. W2 has no dot, so the laser needs
  a new origin. One candidate is the V's point or the notch.
- Legacy brand assets in `public/assets/brand/` all show the old logo and would need regenerating:
  1600×500 logos, app icon, avatar, OG default, social banners, `lumiverse-brand-assets.zip`,
  favicons, `brand-guide.html`.
- MOTION.md and DESIGN.md mention "the LumiVerse wordmark with its coral dot" and would need
  updating.

## 6. Proposed second pass

1. Redraw the symbol on a grid: one stroke width, parallel arm edges, constant gaps, one
   corner-cut rule.
2. Build the wordmark from Golos Text outlines with optical kerning, sized against the symbol
   (today the symbol is about 1.65× the cap height and the gap is 26 units).
3. Deliver a horizontal lockup, a stacked lockup, the symbol alone and a small-size cut for
   favicons, in tokenised colours, with a clear-space and minimum-size spec.
4. Export clean, minimal SVG (no nested scale transforms, real `<title>`) plus PNGs, then a
   comparison board showing old and new versions.

## Open questions

1. Wordmark weight: Golos 500 or 700? The site renders 700 today.
2. Symbol colour: site coral `#ff4d4d`, a deeper coral like `#e03131`, or keep W2's `#D64038`?
   This also decides whether MOTION.md's "coral is human" rule changes.
3. Notch: keep it as the signature detail, simplify it, or drop it from the small-size cut only?
4. Laser origin: where should the hero beam start once the dot is gone?
