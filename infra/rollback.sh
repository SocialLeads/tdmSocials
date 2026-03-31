#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose"
CADDYFILE="./Caddyfile"

STOP_OTHER="${STOP_OTHER:-0}"   # STOP_OTHER=1 ./rollback.sh

log(){ echo -e "\n==> $*"; }
die(){ echo -e "\nERROR: $*" >&2; exit 1; }

current_color() {
  if grep -q "reverse_proxy backend_green:4000" "$CADDYFILE"; then
    echo "green"
  elif grep -q "reverse_proxy backend_blue:4000" "$CADDYFILE"; then
    echo "blue"
  else
    die "Couldn't detect current backend in Caddyfile (expected backend_blue or backend_green)."
  fi
}

set_color() {
  local color="$1"
  cp "Caddyfile.${color}" "$CADDYFILE"
}

ensure_running() {
  local svc="$1"
  log "Ensuring ${svc} is running..."
  $COMPOSE up -d --no-build "$svc" >/dev/null
}

reload_caddy() {
  local container
  container=$($COMPOSE ps -q caddy)
  log "Reloading Caddy config (prefer reload, fallback recreate)..."

  if [[ -n "$container" ]]; then
    if docker exec "$container" caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1; then
      log "Caddy reload succeeded."
      return 0
    else
      log "Caddy reload failed; recreating container..."
    fi
  else
    log "Caddy container not found; starting/recreating via compose..."
  fi

  $COMPOSE up -d --no-build --force-recreate caddy >/dev/null
  log "Caddy recreated."
}

smoke_test() {
  log "Smoke test: GET /api/health (retrying)..."
  for i in {1..30}; do
    if curl -fsS --max-time 2 http://127.0.0.1/api/health >/dev/null; then
      echo "✅ /api/health OK"
      return 0
    fi
    sleep 0.5
  done
  echo "❌ /api/health FAIL"
  return 1
}

wait_backend_ready() {
  local svc="$1"
  local port="$2"
  log "Waiting for ${svc} to respond on /health..."
  for i in {1..60}; do
    if $COMPOSE exec -T "$svc" sh -lc "wget -qO- http://127.0.0.1:${port}/health >/dev/null" 2>/dev/null; then
      log "${svc} is ready."
      return 0
    fi
    sleep 1
  done
  log "Health check timed out. Container logs (last 50 lines):"
  $COMPOSE logs --tail=50 "$svc" >&2
  echo "ERROR: Timed out waiting for ${svc} readiness" >&2
  return 1
}

log "Rollback starting..."
CUR="$(current_color)"

if [[ "$CUR" == "blue" ]]; then
  NEW="green"
  NEW_SVC="backend_green"
  OLD_SVC="backend_blue"
else
  NEW="blue"
  NEW_SVC="backend_blue"
  OLD_SVC="backend_green"
fi

log "Current backend: ${CUR}"
log "Rolling back to: ${NEW} (${NEW_SVC})"

ensure_running "$NEW_SVC"

wait_backend_ready "$NEW_SVC" 4000

log "Updating Caddyfile to point to ${NEW}..."
set_color "$NEW"

reload_caddy

smoke_test

if [[ "$STOP_OTHER" == "1" ]]; then
  log "Stopping previous backend (${OLD_SVC})..."
  $COMPOSE stop "$OLD_SVC" || true
fi

log "Rollback done."
$COMPOSE ps
