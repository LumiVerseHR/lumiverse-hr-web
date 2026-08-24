#!/usr/bin/env bash
# Build and deploy the static site to a VPS via rsync-over-ssh.
#
#   DEPLOY_HOST=<ssh-alias> [DEPLOY_PATH=/var/www/lumiverse.hr] ./deploy.sh
set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST to the ssh alias of the target VPS}"
DEST="${DEPLOY_PATH:-/var/www/lumiverse.hr}"
SHA="$(git rev-parse --short HEAD)"
STAMP="$(date -u +%Y%m%d%H%M%S)"
RELEASE="${DEST}/releases/${STAMP}-${SHA}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

npm run build
npm run test:parity
npm run test:i18n
npm run test:routes

ssh "${HOST}" "mkdir -p '${DEST}/releases'"
rsync -avz --delete dist/ "${HOST}:${RELEASE}/"
ssh "${HOST}" "ln -sfn '${RELEASE}' '${DEST}/current'"

echo "==> deployed ${SHA} to ${HOST}:${RELEASE}"
echo "==> verify: curl -sI https://www.lumiverse.hr/ | head -3"
