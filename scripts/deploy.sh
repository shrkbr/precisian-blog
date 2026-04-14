#!/usr/bin/env bash
set -euo pipefail

VPS_USER="${VPS_USER:-nacaodigital}"
VPS_HOST="${VPS_HOST:-precisian.io}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/precisian-blog}"

echo "→ Building locally..."
npm run build

echo "→ Deploying dist/ to $VPS_USER@$VPS_HOST:$REMOTE_DIR/dist/"
rsync -avz --delete dist/ "$VPS_USER@$VPS_HOST:$REMOTE_DIR/dist/"

echo "✓ Done. Live at https://precisian.io/blog/"
