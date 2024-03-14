#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
set -x

cd $DIR || exit

docker compose -f $DIR/docker-compose.yml --env-file $DIR/services/api/.env.local up --force-recreate -d --wait telegram-bot-api

docker compose -f $DIR/docker-compose.yml up --force-recreate -d --wait --no-deps -V $1
