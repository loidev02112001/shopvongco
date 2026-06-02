#!/bin/sh
set -eu

WORKERD_BIN="./node_modules/@cloudflare/workerd-linux-64/bin/workerd"

if [ ! -x "$WORKERD_BIN" ]; then
  echo "Missing Cloudflare workerd binary: $WORKERD_BIN" >&2
  echo "Rebuild the app image without cache: docker compose build --no-cache app" >&2
  exit 1
fi

exec ./node_modules/.bin/wrangler dev \
  --config dist/server/wrangler.json \
  --ip 0.0.0.0 \
  --port 80 \
  --local \
  --show-interactive-dev-session=false
