#!/usr/bin/env bash

set -e -x

# API_UID=$(id pptruser -u); export API_UID
# API_GID=$(id pptruser -g); export API_GID


cp ./services/web/.env ./deploy/.env.web

sed -i "s/VITE_NODE_ENV=.*/VITE_NODE_ENV=production/g" ./deploy/.env.web

cp ./services/api/.env ./deploy/.env.api

sed -i "s/NODE_ENV=.*/NODE_ENV=production/g" ./deploy/.env.api

docker compose down

./scripts/nginx.up.sh

# start only db
./scripts/docker-up.sh db.liexp.dev

cp ./services/api/certs/*.crt ./deploy/certs/
cd ./deploy || exit

docker compose --env-file .env.api up --force-recreate -d --no-deps api
docker compose --env-file .env.web up --force-recreate -d --no-deps web
docker compose --env-file .env.ai-bot up --force-recreate -d --no-deps ai-bot
sleep 5

docker compose logs -f
