#!/usr/bin/env bash

export DOTENV_CONFIG_PATH="${1:-"../../.env"}"

echo "$DOTENV_CONFIG_PATH"

# cd ../ || exit 1
docker compose stop db db-test
docker compose ps -a
docker rm lies-exposed-db-1 lies-exposed-db-test-1
docker volume rm lies-exposed_db-data lies-exposed_db-test-data
docker compose up -d db db-test
# cd ./services/api/ || exit 1
pnpm migration:run