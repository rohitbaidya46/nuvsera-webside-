#!/usr/bin/env bash
# Updates the website to the latest code on GitHub and restarts it with zero data loss.
#   sudo bash /opt/nuvsera/deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(id -u)" = 0 ] || { echo "Please run with sudo."; exit 1; }
[ -f .env ] || { echo "No .env found — run deploy/install.sh first."; exit 1; }

echo "▶ Backing up the database first"
mkdir -p backups
docker compose exec -T db pg_dump -U nuvsera -Fc nuvsera > "backups/pre-update-$(date +%Y%m%d-%H%M).dump"
echo "▶ Downloading the latest code"
git pull --ff-only
echo "▶ Building"
docker compose build --quiet
echo "▶ Applying database changes"
docker compose --profile tools run --rm migrate
echo "▶ Restarting"
docker compose up -d --remove-orphans
docker image prune -f >/dev/null
echo "✔ Updated to $(git rev-parse --short HEAD)"
