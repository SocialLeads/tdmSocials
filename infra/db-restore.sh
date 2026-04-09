#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# TDM Socials — Database restore
#
# Usage:
#   ./db-restore.sh                                  # restores latest backup
#   ./db-restore.sh backups/backend_db_2026-04-03_020000.sql.gz  # specific file
#   COMPOSE_FILE=../docker-compose.dev.yml ./db-restore.sh       # local dev
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

# Read DB credentials from env file or fall back to defaults
if [ -f "${SCRIPT_DIR}/env/backend.env" ] && [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  source <(grep -E '^DB_(USER|NAME)=' "${SCRIPT_DIR}/env/backend.env")
fi
DB_USER="${DB_USER:-nestuser}"
DB_NAME="${DB_NAME:-backend_db}"

log(){ echo -e "\033[1;34m[restore]\033[0m $*"; }
err(){ echo -e "\033[1;31m[restore]\033[0m $*" >&2; }

# Determine backup file
if [ -n "${1:-}" ]; then
  BACKUP_FILE="$1"
else
  BACKUP_FILE=$(find "$BACKUP_DIR" -name "*.sql.gz" -print | sort | tail -1)
  if [ -z "$BACKUP_FILE" ]; then
    err "No backup files found in $BACKUP_DIR"
    exit 1
  fi
  log "No file specified — using latest: $(basename "$BACKUP_FILE")"
fi

if [ ! -f "$BACKUP_FILE" ]; then
  err "File not found: $BACKUP_FILE"
  exit 1
fi

# Sanity check — is the db container running?
if ! docker compose -f "$COMPOSE_FILE" ps db --format '{{.State}}' 2>/dev/null | grep -q "running"; then
  err "db container is not running (compose file: $COMPOSE_FILE)"
  exit 1
fi

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Restoring ${DB_NAME} from $(basename "$BACKUP_FILE") (${SIZE})"

echo ""
echo "  ⚠  This will DROP and recreate all tables in ${DB_NAME}."
echo "     Press Enter to continue, or Ctrl+C to abort."
echo ""
read -r

log "Restoring..."
gunzip -c "$BACKUP_FILE" \
  | docker compose -f "$COMPOSE_FILE" exec -T db \
    psql -U "$DB_USER" -d "$DB_NAME" --single-transaction -q

log "Done. Database restored from $(basename "$BACKUP_FILE")."
