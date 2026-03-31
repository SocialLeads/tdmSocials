#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose"
CADDYFILE="./Caddyfile"

log(){ echo -e "\n==> $*"; }

current_color() {
  if grep -q "reverse_proxy backend_green:4000" "$CADDYFILE"; then
    echo "green"
  else
    echo "blue"
  fi
}

set_color() {
  local color="$1"
  if [[ "$color" == "green" ]]; then
    sed -i 's/reverse_proxy backend_blue:4000/reverse_proxy backend_green:4000/g' "$CADDYFILE"
  else
    sed -i 's/reverse_proxy backend_green:4000/reverse_proxy backend_blue:4000/g' "$CADDYFILE"
  fi
}

wait_healthy() {
  local svc="$1"
  log "Waiting for ${svc} to become healthy..."
  for i in {1..60}; do
    if $COMPOSE exec -T "$svc" sh -lc 'wget -qO- http://127.0.0.1:4000/health | grep -q "\"ok\""' 2>/dev/null; then
      log "${svc} is healthy."
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for ${svc} health" >&2
  return 1
}

CUR="$(current_color)"
if [[ "$CUR" == "blue" ]]; then
  NEW_SVC="backend_green"
  OLD_SVC="backend_blue"
  NEW_COLOR="green"
else
  NEW_SVC="backend_blue"
  OLD_SVC="backend_green"
  NEW_COLOR="blue"
fi

log "Current color: ${CUR}"
log "Deploying new color: ${NEW_COLOR} (${NEW_SVC})"

log "Pulling latest code..."
git fetch --prune origin
git checkout -f main
git pull --ff-only origin main

log "Building backend images (safe; no downtime during build)..."
$COMPOSE build "$NEW_SVC"

log "Starting new backend..."
$COMPOSE up -d --force-recreate "$NEW_SVC"

wait_healthy "$NEW_SVC"

log "Switching Caddy to ${NEW_COLOR}..."
set_color "$NEW_COLOR"
$COMPOSE up -d --force-recreate caddy

log "Stopping old backend (${OLD_SVC})..."
$COMPOSE stop "$OLD_SVC" || true

log "Done."
$COMPOSE ps
