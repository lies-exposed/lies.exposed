#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd $DIR || exit

# create docker network if not exists
# docker network prune
docker network inspect reverseproxy > /dev/null 2>&1
RET=$?

if [ $RET -ne 0 ]; then
  echo "Remove reverseproxy docker network"
  docker network create reverseproxy
fi

docker compose -f $DIR/docker-compose.reverse-proxy.yml --env-file ./services/api/.env.local up --force-recreate -d "$@"

