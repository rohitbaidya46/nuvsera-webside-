#!/bin/sh
# Nightly PostgreSQL dump used by the db-backup service in docker-compose.yml.
set -eu
STAMP=$(date +%Y%m%d-%H%M)
pg_dump -h db -U nuvsera -Fc nuvsera > "/backups/nuvsera-$STAMP.dump"
# Keep only the most recent dumps (BACKUP_KEEP_DAYS, default 14).
find /backups -maxdepth 1 -name 'nuvsera-*.dump' -mtime +"${BACKUP_KEEP_DAYS:-14}" -exec rm -f {} \;
