#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# Dutchys "pull + rebuild + restart" deploy script
# Run from: /opt/dutchys/dutchies-infra
# Usage:
#   ./deploy.sh               # normal build (uses cache)
#   NO_CACHE=1 ./deploy.sh    # force clean rebuild
#   KEEP_LOCAL=1 ./deploy.sh  # don't hard reset local changes
# ------------------------------------------------------------

BRANCH="${BRANCH:-main}"
NO_CACHE="${NO_CACHE:-0}"
KEEP_LOCAL="${KEEP_LOCAL:-0}"

log() { echo -e "\n\033[1;34m==>\033[0m $*"; }
die() { echo -e "\n\033[1;31mERROR:\033[0m $*" >&2; exit 1; }

# Ensure we are in a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a git repo."

# Ensure docker compose is available
docker compose version >/dev/null 2>&1 || die "docker compose not available."

log "Current directory: $(pwd)"
log "Deploy branch: ${BRANCH}"
log "NO_CACHE=${NO_CACHE}  KEEP_LOCAL=${KEEP_LOCAL}"

# --- Git update ---
log "Fetching latest from origin..."
git fetch --prune origin

log "Checking out ${BRANCH}..."
git checkout -f "${BRANCH}"

if [[ "${KEEP_LOCAL}" != "1" ]]; then
  log "Hard resetting local changes to origin/${BRANCH}..."
  git reset --hard "origin/${BRANCH}"
else
  log "KEEP_LOCAL=1 set: skipping hard reset."
fi

log "Pulling latest (${BRANCH})..."
git pull --ff-only origin "${BRANCH}"

log "Git status:"
git --no-pager status -sb

# --- Docker / Compose cycle ---
log "Stopping containers..."
docker compose down --remove-orphans

# Optional: aggressively prune dangling images (off by default)
# log "Pruning dangling images..."
# docker image prune -f

if [[ "${NO_CACHE}" == "1" ]]; then
  log "Building images (NO CACHE)..."
  docker compose build --no-cache
else
  log "Building images (with cache)..."
  docker compose build
fi

log "Starting containers..."
docker compose up -d --force-recreate

log "Containers status:"
docker compose ps

log "Last 30 log lines (backend + caddy):"
docker logs --tail=30 dutchies-infra-backend-1 2>/dev/null || true
docker logs --tail=30 dutchies-infra-caddy-1 2>/dev/null || true

log "Done."
