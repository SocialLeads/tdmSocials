#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose"
CADDYFILE="./Caddyfile"
BRANCH="${BRANCH:-main}"
NO_CACHE="${NO_CACHE:-0}"

log(){ echo -e "\n==> $*"; }

# ---- helpers ------------------------------------------------

current_backend_color() {
  if grep -q "reverse_proxy backend_green:4000" "$CADDYFILE"; then
    echo "green"
  else
    echo "blue"
  fi
}

set_backend_color() {
  local color="$1"
  cp "Caddyfile.${color}" "$CADDYFILE"
}

reload_caddy() {
  local container
  container=$($COMPOSE ps -q caddy)
  log "Reloading Caddy config (no connection drops)..."
  docker exec "$container" caddy reload --config /etc/caddy/Caddyfile
}

wait_backend_healthy() {
  local svc="$1"
  log "Waiting for ${svc} to become healthy (/health/live)..."
  for i in {1..60}; do
    if $COMPOSE exec -T "$svc" sh -lc 'wget -qO- http://127.0.0.1:4000/health/live | grep -q "ok"' 2>/dev/null; then
      log "${svc} is healthy."
      return 0
    fi
    sleep 1
  done
  log "Health check timed out. Container logs (last 50 lines):"
  $COMPOSE logs --tail=50 "$svc" >&2
  echo "ERROR: ${svc} did not become healthy in 60s" >&2
  return 1
}

build_flags() {
  if [[ "${NO_CACHE}" == "1" ]]; then
    echo "--no-cache"
  else
    echo ""
  fi
}

# ---- deploy -------------------------------------------------

log "Git pull (${BRANCH})..."
git fetch --prune origin
git checkout -f "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

# Decide backend swap
CUR="$(current_backend_color)"
if [[ "$CUR" == "blue" ]]; then
  NEW_SVC="backend_green"
  OLD_SVC="backend_blue"
  NEW_COLOR="green"
else
  NEW_SVC="backend_blue"
  OLD_SVC="backend_green"
  NEW_COLOR="blue"
fi

log "Backend: current=${CUR}, deploying=${NEW_COLOR} (${NEW_SVC})"

# Build all images in parallel — no traffic impact during build
log "Building images (parallel)..."
# shellcheck disable=SC2046
$COMPOSE build $(build_flags) "$NEW_SVC" &
BACKEND_PID=$!
# shellcheck disable=SC2046
$COMPOSE build $(build_flags) frontend_admin &
ADMIN_PID=$!
# shellcheck disable=SC2046
$COMPOSE build $(build_flags) frontend_public &
PUBLIC_PID=$!
wait $BACKEND_PID
wait $ADMIN_PID
wait $PUBLIC_PID

log "Starting new backend container..."
$COMPOSE up -d --force-recreate "$NEW_SVC"

wait_backend_healthy "$NEW_SVC"

log "Switching Caddy upstream to ${NEW_COLOR}..."
set_backend_color "$NEW_COLOR"
reload_caddy

log "Stopping old backend (${OLD_SVC})..."
$COMPOSE stop "$OLD_SVC" || true

# Frontend images already built — container restart only (seconds)
log "Recreating frontends (images pre-built)..."
$COMPOSE up -d --force-recreate frontend_admin frontend_public

# Ensure Redis + Caddy are up
$COMPOSE up -d redis caddy

log "Status:"
$COMPOSE ps

log "Ensuring admin user exists..."
$COMPOSE exec -T "$NEW_SVC" node scripts/create-admin-user.js || log "Admin user creation failed (non-fatal)"

log "Smoke tests:"
curl -fsS http://localhost/api/health/live >/dev/null && echo "  /api/health/live  OK" || echo "  /api/health/live  FAIL"
curl -fsS http://localhost/admin >/dev/null && echo "  /admin            OK" || echo "  /admin            FAIL"
curl -fsS http://localhost/ >/dev/null && echo "  /                 OK" || echo "  /                 FAIL"

log "Done."
