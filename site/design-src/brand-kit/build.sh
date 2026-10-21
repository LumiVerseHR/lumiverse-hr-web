#!/usr/bin/env bash
# Rebuild the whole brand kit: logo files, every visual, the Word templates, the zip.
# PYTHON must have fonttools, uharfbuzz and python-docx installed.
set -euo pipefail
cd "$(dirname "$0")/../.."
PY="${PYTHON:-python3}"

"$PY" design-src/logo/build_logo.py
node design-src/brand-kit/build-kit.mjs
"$PY" design-src/brand-kit/build_docx.py

# One zip with everything a supplier or a new colleague needs.
KIT=public/assets/brand/kit
STAGE=$(mktemp -d)/lumiverse-brand-kit
mkdir -p "$STAGE"/{logo,icons,social,documents,email,meetings,ads,fonts}
cp public/assets/brand/logo/lumiverse-{logo,symbol,wordmark}-*.svg "$STAGE/logo/"
cp "$KIT"/invoice-logo-*.png "$STAGE/logo/"
cp "$KIT"/{favicon.svg,favicon.ico,favicon-32.png,apple-touch-icon.png,icon-192.png,icon-512.png,icon-maskable-512.png,avatar-*.png} "$STAGE/icons/"
cp "$KIT"/{linkedin-*,x-header-*,facebook-cover-*,youtube-banner-*,og-default-*,instagram-post-*,story-*}.png "$STAGE/social/"
cp "$KIT"/{letterhead-*.pdf,letterhead-a4.docx,memo-*.pdf,memo-*.docx,business-card-85x55.pdf} "$STAGE/documents/"
cp "$KIT"/email-signature{-logo.png,.html} "$STAGE/email/"
cp "$KIT"/{video-call-background-*,slide-*}.png "$STAGE/meetings/"
cp "$KIT"/ad-*.png "$STAGE/ads/"
cp "design-src/logo/GolosText[wght].ttf" design-src/logo/OFL.txt design-src/brand-kit/BarlowCondensed-SemiBoldItalic.ttf "$STAGE/fonts/"
cat > "$STAGE/README.txt" <<TXT
LumiVerse brand kit
Generated $(date +%Y-%m-%d). Guide: https://lumiverse.hr/brand-guide  Assets: https://lumiverse.hr/brand-guide/assets

logo/       Lockups, symbol and wordmark as SVG; transparent PNG logos for invoicing tools.
icons/      Favicons, app icons and profile pictures.
social/     Covers and share cards at each network's size.
documents/  Letterhead, memo (EN/HR) and business card. Install fonts/ before editing the DOCX files.
email/      Signature logo and paste-ready HTML signature.
meetings/   Video call background and slide backgrounds.
ads/        Display ads.
fonts/      Golos Text and Barlow Condensed (SIL Open Font License, free to install and share).

Colours: coral #ff4d4d, gallery wall #0e0f12, text #f7f7f6. Use the files as they are; do not redraw, stretch or recolour the logo.
TXT
rm -f "$KIT/lumiverse-brand-kit.zip"
(cd "$(dirname "$STAGE")" && zip -qr - lumiverse-brand-kit) > "$KIT/lumiverse-brand-kit.zip"
echo "zip: $(du -h "$KIT/lumiverse-brand-kit.zip" | cut -f1)"
