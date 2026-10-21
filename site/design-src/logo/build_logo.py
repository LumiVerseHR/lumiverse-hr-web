"""Build the LumiVerse W2 logo: the LV symbol on a 16-unit grid, the wordmark
outlined from Golos Text 500, and every lockup as clean SVG.

Run: python build_logo.py   (needs fonttools + uharfbuzz)
Writes site/public/assets/brand/logo/*.svg and construction.json.
"""

import json
import math
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
FONT = HERE / "GolosText[wght].ttf"
OUT = HERE.parent.parent / "public" / "assets" / "brand" / "logo"
TS_OUT = HERE.parent.parent / "src" / "components" / "chrome" / "logoSymbol.ts"

# Brand tokens (site/src/app/globals.css)
CORAL = "#ff4d4d"
WALL = "#0e0f12"
TEXT = "#f7f7f6"

# ---------------------------------------------------------------- symbol --
# Everything is a multiple of the gap unit U.
U = 16
G = {
    "unit": U,
    "width": 30 * U,        # 480: the V is clipped by this vertical on the right
    "l_height": 24 * U,     # 384: L top to baseline
    "v_top": 2 * U,         # 32: both V arms start one step below the L
    "overshoot": 1 * U,     # 16: the V point dips below the baseline
    "stem": 7 * U,          # 112: L stem, and the perpendicular thickness of each V arm
    "foot": 6 * U,          # 96: L foot (horizontals a touch lighter than verticals)
    "gap": 1 * U,           # 16: every gap, measured perpendicular to the edges
    "chamfer": 1 * U,       # 16: the corner cut on the L
    "slope": 1.8,           # dy/dx of every diagonal, ±
    "notch_depth": 3 * U,   # 48: how far the hook cuts into the left arm
}


def symbol_polygons(g=G):
    k, s, gap = g["slope"], g["stem"], g["gap"]
    W, Hl = g["width"], g["l_height"]
    Hb = Hl + g["overshoot"]
    yt = g["v_top"]
    clip_l = s + gap
    P = (clip_l + W) / 2                       # apex x: the V is symmetric between its clips
    diag = math.sqrt(1 + k * k) / k             # horizontal run of a perpendicular unit
    w = s * diag                                # arm width measured horizontally
    gh = gap * diag
    dh = g["notch_depth"] * diag

    # Lines as x = a + b*y
    outer_l = (P - Hb / k, 1 / k)
    inner_l = (P + w - Hb / k, 1 / k)
    outer_r = (P + Hb / k, -1 / k)
    inner_r = (P - w + Hb / k, -1 / k)
    cut = (P + w + gh - Hb / k, 1 / k)          # right arm stops one gap short of the left arm
    foot_end = (P - gh - Hb / k, 1 / k)         # L foot stops one gap short of the left arm
    notch_lo = (P - w - gh + Hb / k, -1 / k)    # the right arm's inner edge, carried under
    notch_end = (P - Hb / k + dh, 1 / k)

    def at(line, y):
        return (line[0] + line[1] * y, y)

    def meet(l1, l2):
        y = (l2[0] - l1[0]) / (l1[1] - l2[1])
        return at(l1, y)

    def at_x(line, x):
        return (x, (x - line[0]) / line[1])

    yf = Hl - g["foot"]
    c = g["chamfer"]
    L = [(0, 0), (s, 0), (s, yf), at(foot_end, yf), at(foot_end, Hl), (c, Hl), (0, Hl - c)]
    left_arm = [
        (clip_l, yt), at(inner_l, yt), meet(inner_l, outer_r), (P, Hb),
        meet(outer_l, inner_r), meet(inner_r, notch_end), meet(notch_lo, notch_end),
        meet(outer_l, notch_lo), at_x(outer_l, clip_l),
    ]
    right_arm = [at(inner_r, yt), (W, yt), at_x(outer_r, W), meet(outer_r, cut), meet(inner_r, cut)]
    return [L, left_arm, right_arm], (W, Hb)


def poly_d(polys, scale=1.0, dx=0.0, dy=0.0):
    out = []
    for p in polys:
        pts = " ".join(f"{fmt(x * scale + dx)} {fmt(y * scale + dy)}" for x, y in p)
        out.append(f"M{pts}Z")
    return "".join(out)


def fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


# -------------------------------------------------------------- wordmark --
WEIGHT = 500
TRACKING = -0.02   # em, matches the site header
DOT = 0.34         # em, matches Header.module.css .dot
DOT_GAP = 0.12     # em, tighter than the header (0.3em): at logo size 0.3 reads detached


def wordmark(text="LumiVerse"):
    """Return (path d in font units, y-up flipped to y-down with baseline at 0,
    advance width, cap height, units per em)."""
    vf = TTFont(FONT)
    static = instancer.instantiateVariableFont(vf, {"wght": WEIGHT})
    upem = static["head"].unitsPerEm
    cap = static["OS/2"].sCapHeight
    gs = static.getGlyphSet()
    order = static.getGlyphOrder()

    blob = hb.Blob.from_file_path(str(FONT))
    font = hb.Font(hb.Face(blob))
    font.set_variations({"wght": WEIGHT})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": False})

    track = TRACKING * upem
    x = 0.0
    pen = SVGPathPen(gs, ntos=lambda v: fmt(v))
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        name = order[info.codepoint]
        tp = TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
        gs[name].draw(tp)
        x += pos.x_advance + (track if i < len(buf.glyph_infos) - 1 else 0)
    return pen.getCommands(), x, cap, upem


# --------------------------------------------------------------- lockups --
def svg(w, h, body, title="LumiVerse"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}" '
            f'width="{fmt(w)}" height="{fmt(h)}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    polys, (sw, sh) = symbol_polygons()
    wd, adv, cap, upem = wordmark()

    # Work in a lockup space where cap height = 100.
    f = 100 / cap
    em = upem * f
    dot_r = DOT * em / 2
    dot_cx = adv * f + DOT_GAP * em + dot_r
    word_w = dot_cx + dot_r
    word_d = lambda dx, dy: f'<path transform="translate({fmt(dx)} {fmt(dy)}) scale({fmt(f)})" d="{wd}"/>'

    # Horizontal: the symbol's L shares the text baseline, L height = 1.35 cap.
    sym_scale = 135 / G["l_height"]
    sym_w = sw * sym_scale
    gap = G["stem"] * sym_scale             # symbol↔text gap = one stem
    pad = G["stem"] * sym_scale             # clear space = one stem
    base = pad + 135
    H = base + G["overshoot"] * sym_scale + pad
    W = pad + sym_w + gap + word_w + pad
    tx = pad + sym_w + gap

    def horizontal(mark, text, dot):
        return svg(W, H,
                   f'<path fill="{mark}" d="{poly_d(polys, sym_scale, pad, pad)}"/>'
                   f'<g fill="{text}">{word_d(tx, base)}</g>'
                   f'<circle fill="{dot}" cx="{fmt(tx + dot_cx)}" cy="{fmt(base - dot_r)}" r="{fmt(dot_r)}"/>')

    # Stacked: symbol centred over the word, L height = 2.6 cap.
    st_scale = 260 / G["l_height"]
    st_w, st_h = sw * st_scale, sh * st_scale
    st_gap = 60
    SW = pad * 2 + max(st_w, word_w)
    SH = pad + st_h + st_gap + 100 + pad
    st_x = (SW - st_w) / 2
    st_tx = (SW - word_w) / 2
    st_base = pad + st_h + st_gap + 100

    def stacked(mark, text, dot):
        return svg(SW, SH,
                   f'<path fill="{mark}" d="{poly_d(polys, st_scale, st_x, pad)}"/>'
                   f'<g fill="{text}">{word_d(st_tx, st_base)}</g>'
                   f'<circle fill="{dot}" cx="{fmt(st_tx + dot_cx)}" cy="{fmt(st_base - dot_r)}" r="{fmt(dot_r)}"/>')

    def symbol(col, padding=U * 2):
        return svg(sw + padding * 2, sh + padding * 2,
                   f'<path fill="{col}" d="{poly_d(polys, 1, padding, padding)}"/>', "LumiVerse symbol")

    def word_only(text, dot):
        p = 30
        return svg(word_w + p * 2, 100 + p * 2 + 4,
                   f'<g fill="{text}">{word_d(p, p + 100)}</g>'
                   f'<circle fill="{dot}" cx="{fmt(p + dot_cx)}" cy="{fmt(p + 100 - dot_r)}" r="{fmt(dot_r)}"/>')

    # Favicon: symbol on the gallery wall, square.
    fav_pad = 64
    fav_side = sw + fav_pad * 2
    fav_dy = (fav_side - sh) / 2
    favicon = svg(fav_side, fav_side,
                  f'<rect width="100%" height="100%" fill="{WALL}"/>'
                  f'<path fill="{CORAL}" d="{poly_d(polys, 1, fav_pad, fav_dy)}"/>', "LumiVerse")

    files = {
        "lumiverse-logo-dark.svg": horizontal(CORAL, TEXT, CORAL),
        "lumiverse-logo-light.svg": horizontal(CORAL, WALL, CORAL),
        "lumiverse-logo-black.svg": horizontal(WALL, WALL, WALL),
        "lumiverse-logo-white.svg": horizontal("#ffffff", "#ffffff", "#ffffff"),
        "lumiverse-logo-stacked-dark.svg": stacked(CORAL, TEXT, CORAL),
        "lumiverse-logo-stacked-light.svg": stacked(CORAL, WALL, CORAL),
        "lumiverse-symbol-coral.svg": symbol(CORAL),
        "lumiverse-symbol-black.svg": symbol(WALL),
        "lumiverse-symbol-white.svg": symbol("#ffffff"),
        "lumiverse-wordmark-dark.svg": word_only(TEXT, CORAL),
        "lumiverse-wordmark-light.svg": word_only(WALL, CORAL),
        "lumiverse-favicon.svg": favicon,
    }
    for name, body in files.items():
        (OUT / name).write_text(body)

    (OUT / "construction.json").write_text(json.dumps({
        "grid": G,
        "symbol_size": [round(sw, 2), round(sh, 2)],
        "polygons": [[[round(x, 2), round(y, 2)] for x, y in p] for p in polys],
        "wordmark": {"font": "Golos Text", "weight": WEIGHT, "tracking_em": TRACKING,
                     "dot_em": DOT, "dot_gap_em": DOT_GAP, "cap_height_units": cap, "upem": upem},
        "lockup": {"cap_height": 100, "symbol_l_height": 135, "gap": round(gap, 2),
                   "clear_space": round(pad, 2), "size": [round(W, 2), round(H, 2)]},
    }, indent=2) + "\n")
    for name in files:
        print(f"{name:40s} {(OUT / name).stat().st_size:>6} B")

    # The site header draws the symbol inline from this module, next to live Golos text.
    # Sizes are in em of the wordmark's font size, so the header lockup matches the files.
    em_per_unit = (cap / upem) * 1.35 / G["l_height"]
    (TS_OUT).write_text(
        "// Generated by site/design-src/logo/build_logo.py. Do not edit by hand.\n"
        f'export const SYMBOL_VIEWBOX = "0 0 {fmt(sw)} {fmt(sh)}";\n'
        f'export const SYMBOL_PATH = "{poly_d(polys)}";\n'
        "export const LOCKUP = {\n"
        f"  height: {sh * em_per_unit:.4f}, // em\n"
        f"  width: {sw * em_per_unit:.4f}, // em\n"
        f"  gap: {G['stem'] * em_per_unit:.4f}, // em, symbol to text: one stem\n"
        f"  drop: {G['overshoot'] * em_per_unit:.4f}, // em, the V point below the baseline\n"
        f"  dotGap: {DOT_GAP}, // em\n"
        f"  dot: {DOT}, // em\n"
        "} as const;\n"
    )


if __name__ == "__main__":
    build()
