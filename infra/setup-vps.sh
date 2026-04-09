#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# TDM Socials — VPS first-time setup
# Run as root on a fresh Ubuntu/Debian VPS:
#   curl -sL <raw-github-url>/infra/setup-vps.sh | bash
#   — or —
#   ssh root@your-vps 'bash -s' < setup-vps.sh
# ============================================================

REPO_URL="${REPO_URL:-git@github.com:YOUR_USERNAME/socialContentGenerator.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/socialContentGenerator}"

log(){ echo -e "\n\033[1;34m==> $*\033[0m"; }
warn(){ echo -e "\033[1;33m    ⚠  $*\033[0m"; }
ok(){ echo -e "\033[1;32m    ✓  $*\033[0m"; }

# ---- 1. System packages ------------------------------------
log "Updating system & installing essentials..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq git curl ufw

# ---- 2. Docker ---------------------------------------------
if command -v docker &>/dev/null; then
  ok "Docker already installed: $(docker --version)"
else
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  ok "Docker installed: $(docker --version)"
fi

# ---- 3. Firewall -------------------------------------------
log "Configuring firewall (SSH + HTTP + HTTPS)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall active"

# ---- 4. Clone repo -----------------------------------------
if [ -d "$INSTALL_DIR/.git" ]; then
  ok "Repo already cloned at $INSTALL_DIR"
else
  log "Cloning repo to $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  ok "Cloned"
fi

cd "$INSTALL_DIR/infra"

# ---- 5. Generate env files ---------------------------------
log "Setting up environment files..."

if [ -f env/backend.env ]; then
  warn "env/backend.env already exists — skipping (delete it to regenerate)"
else
  # Generate random secrets
  JWT_SECRET=$(openssl rand -base64 32)
  JWT_RESET_SECRET=$(openssl rand -base64 32)
  DB_PASSWORD=$(openssl rand -base64 24)

  cat > env/backend.env <<EOF
NODE_ENV=production
PORT=4000

# Database (Docker service)
DB_HOST=db
DB_PORT=5432
DB_USER=nestuser
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=backend_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_RESET_SECRET=${JWT_RESET_SECRET}
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=15d

# OpenAI — FILL THIS IN
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# SMTP
SMTP_HOST=smtp.privateemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@tdmsocials.nl
SMTP_PASS=
SMTP_FROM=info@tdmsocials.nl
SMTP_FROM_NAME=TDM Socials

# Admin
ADMIN_CONTACT_EMAIL=info@tdmsocials.nl
FRONTEND_DOMAIN=https://tdmsocials.nl,https://www.tdmsocials.nl

# Cron (8 AM daily)
CRON_SCHEDULE=0 8 * * *
EOF

  ok "env/backend.env created with generated secrets"
  warn "You still need to fill in: OPENAI_API_KEY and SMTP_PASS"
fi

# Also create the .env for docker compose postgres vars
if [ ! -f .env ]; then
  # Source the backend env to get DB vars for compose
  DB_PASSWORD=$(grep DB_PASSWORD env/backend.env | cut -d= -f2)
  DB_USER=$(grep DB_USER env/backend.env | cut -d= -f2)
  DB_NAME=$(grep DB_NAME env/backend.env | cut -d= -f2)
  cat > .env <<EOF
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
EOF
  ok ".env created for Docker Compose"
fi

# ---- 6. Install daily DB backup cron ------------------------
CRON_CMD="0 2 * * * cd $INSTALL_DIR/infra && ./db-backup.sh >> /var/log/tdm-db-backup.log 2>&1"
if crontab -l 2>/dev/null | grep -qF "db-backup.sh"; then
  ok "DB backup cron already installed"
else
  (crontab -l 2>/dev/null || true; echo "$CRON_CMD") | crontab -
  ok "DB backup cron installed (daily at 2:00 AM)"
fi

# ---- 7. Initialize Caddyfile for first deploy --------------
if [ ! -f Caddyfile ]; then
  cp Caddyfile.blue Caddyfile
  ok "Caddyfile initialized (blue)"
fi

# ---- Done ---------------------------------------------------
log "Setup complete!"
echo ""
echo "  Next steps:"
echo "  ─────────────────────────────────────────────────"
echo "  1. Point DNS:  A record  @    → $(curl -s ifconfig.me)"
echo "                 A record  www  → $(curl -s ifconfig.me)"
echo ""
echo "  2. Fill in secrets:"
echo "     nano $INSTALL_DIR/infra/env/backend.env"
echo "     → OPENAI_API_KEY"
echo "     → SMTP_PASS"
echo ""
echo "  3. Deploy:"
echo "     cd $INSTALL_DIR/infra"
echo "     ./deploy-bg.sh"
echo ""
echo "  4. Create admin user:"
echo "     docker compose exec backend_blue node dist/scripts/create-admin-user.js"
echo "  ─────────────────────────────────────────────────"
echo ""
