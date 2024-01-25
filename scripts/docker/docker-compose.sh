#!/usr/bin/env bash

set -x

# get all args

args=$@


# create docker network if not exists
docker network inspect reverseproxy > /dev/null 2>&1
RET=$?
if [ $RET -ne 0 ]; then
  echo "Creating reverseproxy docker network"
  docker network create reverseproxy
fi

docker compose up -d --force-recreate reverseproxy

# if theres a param use it to set the services to up
# otherwise use the default

COMMAND=${args:-"up -d --force-recreate api.liexp.dev admin.liexp.dev liexp.dev"}


docker compose \
    --env-file ./services/api/.env.local \
    $COMMAND