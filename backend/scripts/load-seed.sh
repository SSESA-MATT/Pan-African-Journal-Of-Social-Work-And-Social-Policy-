#!/usr/bin/env bash
set -euo pipefail

# script to load SQL seed into local DB. It prefers DATABASE_URL if set, otherwise
# will attempt to use docker-compose service named 'db'.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEED_FILE="${ROOT_DIR}/database_seed.sql"

if [ ! -f "$SEED_FILE" ]; then
  # try alternate names
  for f in "$ROOT_DIR"/database_seed_*.sql "$ROOT_DIR"/database_seed*.sql; do
    if [ -f "$f" ]; then
      SEED_FILE="$f"
      break
    fi
  done
fi

if [ ! -f "$SEED_FILE" ]; then
  echo "No seed file found in project root (looked for database_seed*.sql)." >&2
  exit 1
fi

echo "Using seed file: $SEED_FILE"

if [ -n "${DATABASE_URL:-}" ]; then
  if command -v psql >/dev/null 2>&1; then
    echo "Loading seed via psql using DATABASE_URL"
    psql "$DATABASE_URL" -f "$SEED_FILE"
  else
    echo "psql not available locally. Attempting to use docker-compose exec to run psql inside service 'db'"
    docker compose exec -T db psql -U postgres -d pan_afri_local < "$SEED_FILE"
  fi
else
  echo "DATABASE_URL not set. Using docker-compose service 'db' to load seed (requires docker compose up -d)"
  docker compose exec -T db psql -U postgres -d pan_afri_local < "$SEED_FILE"
fi

echo "Seed load complete."
