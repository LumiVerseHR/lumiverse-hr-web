#!/usr/bin/env python3
"""Keep the shared <nav>, mobile nav and <footer> blocks identical across pages.

Two language trees, each with its own canonical partials:

    English   pages: *.html          partials: partials/
    Croatian  pages: hr/*.html       partials: partials/hr/

Partials are stored in "subpage" form (links like index.html#work for English,
/hr/#work for Croatian). Each tree's homepage legitimately uses same-page
anchors instead; that variant is derived automatically, so the homepages are
checked and synced too — no false positives.

Partials may contain the placeholder {{alt_url}}, which is replaced per page
with the URL of that page's counterpart in the other language (the language
switcher in the nav). index.html <-> /hr/, rentalica.html <-> /hr/rentalica.

Pages with an intentionally different/minimal chrome (404, brand-guide) are
skipped.

Usage:
  python3 scripts/sync_shared.py            # rewrite every page from the partials
  python3 scripts/sync_shared.py --check    # verify only; exit 1 on drift (deploy/CI/hook)
"""
import sys
import difflib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (name, opening-tag substring, tag name, required)
# required=True  -> must exist on every synced page (missing = drift)
# required=False -> only checked/synced on pages that actually contain it
REGIONS = [
    ("nav", "<nav ", "nav", True),
    ("mobile-nav", '<div class="mobile-nav"', "div", True),
    ("footer", "<footer", "footer", True),
    ("capacity-note", '<div class="capacity-note"', "div", False),
    ("consent", '<div class="consent"', "div", True),
]

# Pages that do NOT carry the full shared chrome, by design.
SKIP = {"404.html", "brand-guide.html"}
HOMEPAGE = "index.html"


def en_homepage_form(block):
    """English subpage canonical -> homepage form: same-page anchors + root logo."""
    block = block.replace('href="index.html#', 'href="#')
    block = block.replace('href="index.html" class="nav-logo"', 'href="/" class="nav-logo"')
    return block


def hr_homepage_form(block):
    """Croatian subpage canonical -> homepage form: same-page anchors.

    The Croatian logo already points at /hr/, which is correct on the homepage
    too, so only the section anchors change.
    """
    return block.replace('href="/hr/#', 'href="#')


class Tree:
    """One language tree: its pages, its partials, and its counterpart URLs."""

    def __init__(self, label, page_dir, partial_dir, homepage_form, alt_url):
        self.label = label
        self.page_dir = page_dir
        self.partial_dir = partial_dir
        self.homepage_form = homepage_form
        self.alt_url = alt_url

    def pages(self):
        if not self.page_dir.is_dir():
            return []
        return sorted(p for p in self.page_dir.glob("*.html") if p.name not in SKIP)


TREES = [
    Tree(
        "en",
        ROOT,
        ROOT / "partials",
        en_homepage_form,
        lambda name: "/hr/" if name == HOMEPAGE else f"/hr/{Path(name).stem}",
    ),
    Tree(
        "hr",
        ROOT / "hr",
        ROOT / "partials" / "hr",
        hr_homepage_form,
        lambda name: "/" if name == HOMEPAGE else f"/{Path(name).stem}",
    ),
]


def extract(text, start, tag):
    """First balanced <tag>..</tag> span starting at `start`.

    Returns (block_str, start_line_idx, end_line_idx) or None. Depth-aware, so
    a region that nests the same tag (the mobile nav wraps the language
    switcher in a <div>) is captured whole rather than cut at the first close.
    """
    lines = text.splitlines(keepends=True)
    si = next((i for i, ln in enumerate(lines) if start in ln), None)
    if si is None:
        return None

    opener = re.compile(rf"<{tag}\b")
    closer = re.compile(rf"</{tag}\s*>")
    depth = 0
    for i in range(si, len(lines)):
        depth += len(opener.findall(lines[i]))
        depth -= len(closer.findall(lines[i]))
        if depth <= 0:
            return "".join(lines[si:i + 1]), si, i
    return None


def expected(tree, page_name, canonical):
    block = tree.homepage_form(canonical) if page_name == HOMEPAGE else canonical
    return block.replace("{{alt_url}}", tree.alt_url(page_name))


def main():
    check = "--check" in sys.argv

    drift, changed, synced_pages = [], [], 0

    for tree in TREES:
        pages = tree.pages()
        if not pages:
            continue

        canon = {}
        for name, *_ in REGIONS:
            f = tree.partial_dir / f"{name}.html"
            if not f.exists():
                print(f"missing canonical partial: {f.relative_to(ROOT)}", file=sys.stderr)
                return 2
            canon[name] = f.read_text()

        for p in pages:
            label = str(p.relative_to(ROOT))
            text = new_text = p.read_text()
            for name, start, tag, required in REGIONS:
                found = extract(new_text, start, tag)
                if not found:
                    if required:
                        drift.append((label, name, f"MISSING <{name}> region"))
                    continue
                actual, si, ei = found
                want = expected(tree, p.name, canon[name])
                if actual == want:
                    continue
                if check:
                    diff = "".join(difflib.unified_diff(
                        actual.splitlines(keepends=True),
                        want.splitlines(keepends=True),
                        fromfile=f"{label} :: {name} (actual)",
                        tofile=f"{tree.partial_dir.relative_to(ROOT)}/{name}.html (expected)"))
                    drift.append((label, name, diff))
                else:
                    lines = new_text.splitlines(keepends=True)
                    new_text = "".join(lines[:si]) + want + "".join(lines[ei + 1:])
            if not check and new_text != text:
                p.write_text(new_text)
                changed.append(label)
            synced_pages += 1

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
        print(f"✓ shared regions ({names}) in sync across {synced_pages} pages")
        return 0

    if changed:
        print(f"✓ synced {len(changed)} page(s): {', '.join(changed)}")
    else:
        print("✓ already in sync — nothing to write")
    return 0


if __name__ == "__main__":
    sys.exit(main())
