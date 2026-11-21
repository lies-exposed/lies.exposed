#!/usr/bin/env bash
# Optional docker-based smoke test: starts api + web and curls their healthchecks.
# Opt-in from the pre-push hook with PREPUSH_HEALTHCHECK=1; needs a usable docker.

set -e

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "healthcheck: docker unavailable, skipping" >&2
  exit 0
fi

set -x

# start api with docker
docker compose up -d --wait liexp.dev api.liexp.dev

curl --cacert ./_data/certs/liexp.dev.crt -f https://api.liexp.dev/v1/healthcheck
curl --cacert ./_data/certs/liexp.dev.crt -f https://liexp.dev/healthcheck
