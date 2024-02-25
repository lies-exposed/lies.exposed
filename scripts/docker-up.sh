#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd $DIR || exit

docker compose -f $DIR/docker-compose.yml up --force-recreate -d --wait $1
