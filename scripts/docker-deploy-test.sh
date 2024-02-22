#!/usr/bin/env bash

API_UID=$(id pptruser -u); export API_UID
API_GID=$(id pptruser -g); export API_GID

cp ./services/api/.env ./deploy/.env.api
cp ./services/web/.env ./deploy/.env.web

sed -i "s/VITE_NODE_ENV=.*/VITE_NODE_ENV=production/g" ./deploy/.env.web

docker compose down

# start only db
docker compose up db -d

cp ./services/api/certs/*.crt ./deploy/certs/
cd ./deploy || return

# set -a
# source .env.api
# set +a

docker compose --env-file .env.api up --build --force-recreate -d api
docker compose --env-file .env.api --env-file .env.web up --build --force-recreate -d web
sleep 5
docker compose logs -f

# docker compose down
cd ../ || return