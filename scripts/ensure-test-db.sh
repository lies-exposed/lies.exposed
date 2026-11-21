#!/usr/bin/env bash
# Make sure a Postgres is reachable for the e2e tests (DB_HOST/DB_PORT in
# services/api/.env.test), without requiring docker.
#
# - already reachable (docker, native postgres, remote tunnel, ...) -> nothing to do
# - not reachable and docker is usable -> start the compose db service
# - not reachable and no docker (e.g. agent VM) -> warn and continue; provide a
#   database on DB_PORT yourself or the DB-backed tests will fail.

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-8432}"

if (echo > "/dev/tcp/${DB_HOST}/${DB_PORT}") 2>/dev/null; then
  echo "ensure-test-db: ${DB_HOST}:${DB_PORT} reachable, skipping docker"
  exit 0
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker compose up -d db.liexp.dev
  exit $?
fi

echo "ensure-test-db: ${DB_HOST}:${DB_PORT} not reachable and docker unavailable; continuing without a database" >&2
exit 0
