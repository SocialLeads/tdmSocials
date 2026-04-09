#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# TDM Socials — Database backup
#
# Usage:
#   ./db-backup.sh                     # prod (from infra/)
#   COMPOSE_FILE=../docker-compose.dev.yml ./db-backup.sh  # local dev
#
# Backups are saved to ./backups/ as compressed .sql.gz files.
# Keeps the last KEEP_DAYS days (default: 7).
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
KEEP_DAYS="${KEEP_DAYS:-30}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"

# Read DB credentials from env file or fall back to defaults
if [ -f "${SCRIPT_DIR}/env/backend.env" ] && [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  source <(grep -E '^DB_(USER|NAME)=' "${SCRIPT_DIR}/env/backend.env")
fi
DB_USER="${DB_USER:-nestuser}"
DB_NAME="${DB_NAME:-backend_db}"

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

log(){ echo -e "\033[1;34m[backup]\033[0m $*"; }
err(){ echo -e "\033[1;31m[backup]\033[0m $*" >&2; }

# Sanity check — is the db container running?
if ! docker compose -f "$COMPOSE_FILE" ps db --format '{{.State}}' 2>/dev/null | grep -q "running"; then
  err "db container is not running (compose file: $COMPOSE_FILE)"
  exit 1
fi

log "Dumping ${DB_NAME}..."
docker compose -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U "$DB_USER" --clean --if-exists --no-owner "$DB_NAME" \
  | gzip > "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Saved: ${BACKUP_FILE} (${SIZE})"

# Rotate old backups
DELETED=0
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +"$KEEP_DAYS" -print -delete | while read -r f; do
  DELETED=$((DELETED + 1))
done
REMAINING=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l | tr -d ' ')
log "Backups on disk: ${REMAINING} (keeping last ${KEEP_DAYS} days)"

log "Done."
