#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd $DIR || exit

# docker compose -f $DIR/docker-compose.reverse-proxy.yml down --remove-orphans

# create docker network if not exists
# docker network prune
docker network inspect reverseproxy > /dev/null 2>&1
RET=$?

if [ $RET -ne 1 ]; then
  echo "Remove reverseproxy docker network"
  # docker network rm reverseproxy
fi

docker network create reverseproxy

# if [ $RET -ne 0 ]; then
#   echo "Creating reverseproxy docker network"
#   docker network create reverseproxy
# fi


docker compose -f $DIR/docker-compose.reverse-proxy.yml up --force-recreate -d

docker compose -f $DIR/docker-compose.yml up --force-recreate -d --wait $1
