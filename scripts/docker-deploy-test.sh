#!/usr/bin/env bash

API_UID=$(id pptruser -u); export API_UID
API_GID=$(id pptruser -g); export API_GID

cp ./services/api/.env.alpha ./deploy/.env.api
cp ./services/web/.env ./deploy/.env.web

# echo "Update api env HOST=$appium_server_ip to .env.local"

# sed -i "s/HOST=.*/HOST=$appium_server_ip/g" ./deploy/.env.api

cp ./services/api/certs/*.crt ./deploy/certs/
cd ./deploy || return

set -a
source .env.api
set +a

docker compose up --build --force-recreate -d
sleep 5
docker compose logs -f

# docker compose down
cd ../ || return