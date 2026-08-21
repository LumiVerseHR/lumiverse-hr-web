#!/usr/bin/env python3
"""Keep the shared <nav> and <footer> blocks identical across every page.

Single source of truth: partials/nav.html and partials/footer.html, both in
"subpage" form (links like index.html#work). The homepage legitimately uses
same-page anchors (#work) and a "/" logo instead; that variant is derived
automatically, so index.html is checked and synced too — no false positives.

Pages with an intentionally different/minimal chrome (404, brand-guide) are
skipped.

Usage:
  python3 scripts/sync_shared.py            # rewrite every page from the partials
  python3 scripts/sync_shared.py --check    # verify only; exit 1 on drift (deploy/CI/hook)
"""
import sys
import difflib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials"

# (name, opening-tag substring, closing-tag substring, required)
# required=True  -> must exist on every synced page (missing = drift)
# required=False -> only checked/synced on pages that actually contain it
REGIONS = [
    ("nav", "<nav ", "</nav>", True),
    ("footer", "<footer", "</footer>", True),
    ("capacity-note", '<div class="capacity-note"', "</div>", False),
]

# Pages that do NOT carry the full shared nav+footer, by design.
SKIP = {"404.html", "brand-guide.html"}
HOMEPAGE = "index.html"


def pages():
    return sorted(p for p in ROOT.glob("*.html") if p.name not in SKIP)


def extract(text, start, end):
    """First start..end span as (block_str, start_line_idx, end_line_idx), or None."""
    lines = text.splitlines(keepends=True)
    si = next((i for i, ln in enumerate(lines) if start in ln), None)
    if si is None:
        return None
    ei = next((i for i in range(si, len(lines)) if end in lines[i]), None)
    if ei is None:
        return None
    return "".join(lines[si:ei + 1]), si, ei


def to_homepage(block):
    """Subpage canonical -> homepage form: same-page anchors + root logo."""
    block = block.replace('href="index.html#', 'href="#')
    block = block.replace('href="index.html" class="nav-logo"', 'href="/" class="nav-logo"')
    return block


def expected(page_name, canonical):
    return to_homepage(canonical) if page_name == HOMEPAGE else canonical


def main():
    check = "--check" in sys.argv

    canon = {}
    for name, *_ in REGIONS:
        f = PARTIALS / f"{name}.html"
        if not f.exists():
            print(f"missing canonical partial: {f.relative_to(ROOT)}", file=sys.stderr)
            return 2
        canon[name] = f.read_text()

    drift, changed = [], []
    for p in pages():
        text = new_text = p.read_text()
        for name, start, end, required in REGIONS:
            found = extract(new_text, start, end)
            if not found:
                if required:
                    drift.append((p.name, name, f"MISSING <{name}> region"))
                continue
            actual, si, ei = found
            want = expected(p.name, canon[name])
            if actual == want:
                continue
            if check:
                diff = "".join(difflib.unified_diff(
                    actual.splitlines(keepends=True),
                    want.splitlines(keepends=True),
                    fromfile=f"{p.name} :: {name} (actual)",
                    tofile=f"partials/{name}.html (expected)"))
                drift.append((p.name, name, diff))
            else:
                lines = new_text.splitlines(keepends=True)
                new_text = "".join(lines[:si]) + want + "".join(lines[ei + 1:])
        if not check and new_text != text:
            p.write_text(new_text)
            changed.append(p.name)

    if check:
        if drift:
            print("✗ shared-block drift detected:\n")
            for page, region, info in drift:
                print(f"── {page} · {region} ──")
                print(info.rstrip("\n"))
                print()
            print("Fix with:  python3 scripts/sync_shared.py")
            return 1
        names = ", ".join(name for name, *_ in REGIONS)
        print(f"✓ shared regions ({names}) in sync across {len(pages())} pages")
        return 0

    if changed:
        print(f"✓ synced {len(changed)} page(s): {', '.join(changed)}")
    else:
        print("✓ already in sync — nothing to write")
    return 0


if __name__ == "__main__":
    sys.exit(main())
