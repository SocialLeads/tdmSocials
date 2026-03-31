#!/usr/bin/env bash
# ngrok.sh — Start all ngrok tunnels for local development.
# Merges the repo tunnel config (../ngrok.yml) with the global ngrok config
# (which holds the authtoken). No secrets in this file.
#
# Usage: ./dutchies-infra/ngrok.sh

set -euo pipefail

GLOBAL_CONFIG="$HOME/Library/Application Support/ngrok/ngrok.yml"
REPO_CONFIG="$(cd "$(dirname "$0")" && pwd)/ngrok.yml"

if [ ! -f "$GLOBAL_CONFIG" ]; then
  echo "❌ Global ngrok config not found at: $GLOBAL_CONFIG"
  exit 1
fi

if [ ! -f "$REPO_CONFIG" ]; then
  echo "❌ Repo ngrok config not found at: $REPO_CONFIG"
  exit 1
fi

echo "🚇 Starting ngrok tunnels..."
echo "   Global config: $GLOBAL_CONFIG"
echo "   Repo config:   $REPO_CONFIG"
echo ""

ngrok start --all \
  --config "$GLOBAL_CONFIG" \
  --config "$REPO_CONFIG"
