#!/usr/bin/env python3
"""Submit the site's canonical page URLs to IndexNow (Bing / Yandex / Seznam)
so they re-crawl changes within minutes.

Run AFTER deploying, so the key file at KEYLOC is already live:
    npm run build && python3 scripts/indexnow.py

Reads dist/sitemap.xml, not the source one: the source still carries .html
URLs, which the build rewrites to the canonical extensionless form. Submitting
the source URLs would hand IndexNow 16 addresses that only 308-redirect.

The key is public by design (hosted at KEYLOC for verification) — not a secret.
"""
import json, sys, urllib.request, urllib.error, xml.etree.ElementTree as ET

HOST = "www.lumiverse.hr"
KEY = "9a989dede381f46ba9e5cd01bc2f05be"
KEYLOC = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"

ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
SITEMAP = "dist/sitemap.xml"
try:
    root = ET.parse(SITEMAP).getroot()
except FileNotFoundError:
    sys.exit(f"{SITEMAP} not found — run `npm run build` first.")
urls = [u.find("s:loc", ns).text for u in root.findall("s:url", ns)]
urls = [u for u in urls if "#" not in u]          # drop on-page fragment anchors

payload = {"host": HOST, "key": KEY, "keyLocation": KEYLOC, "urlList": urls}
req = urllib.request.Request(
    ENDPOINT, data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json; charset=utf-8"},
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"IndexNow OK: HTTP {r.status} — submitted {len(urls)} URLs")
        for u in urls:
            print("  " + u)
except urllib.error.HTTPError as e:
    print(f"IndexNow FAILED: HTTP {e.code} — {e.read().decode()[:300]}")
    sys.exit(1)
