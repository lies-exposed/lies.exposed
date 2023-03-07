#!/usr/bin/env bash

USER=$1
export API_UID=$(id pptruser -u)
export API_GID=$(id pptruser -g)
cp .env.alpha ./deploy/.env.api
cp ./services/web/.env ./deploy/.env.web
cp ./services/api/certs/*.crt ./deploy/certs/
cd ./deploy || return
docker compose up --build --force-recreate
docker system prune -f
cd ../ || return