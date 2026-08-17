#!/usr/bin/env bash
# Deploy the static site to a VPS via rsync-over-ssh.
#
#   DEPLOY_HOST=<ssh-alias> [DEPLOY_PATH=/var/www/lumiverse.hr] ./deploy.sh
#
# NOTE (2026-08-17): www.lumiverse.hr currently serves from Vercel
# (git push to main auto-deploys). This script is prepared for the
# planned VPS migration — see the migration issue in GitHub. Until DNS
# moves, running this deploys to a box nothing points at.
set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST to the ssh alias of the target VPS}"
DEST="${DEPLOY_PATH:-/var/www/lumiverse.hr}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

# Everything the site serves, nothing it doesn't.
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '.DS_Store' \
  --exclude '.playwright-mcp' \
  --exclude 'reports' \
  --exclude 'deploy.sh' \
  --exclude 'scripts' \
  --exclude 'README.md' \
  ./ "${HOST}:${DEST}/"

echo "==> deployed to ${HOST}:${DEST}"
echo "==> verify: curl -sI https://www.lumiverse.hr/ | head -3"
