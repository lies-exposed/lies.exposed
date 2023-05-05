#!/usr/bin/env bash

API_UID=$(id pptruser -u); export API_UID
API_GID=$(id pptruser -g); export API_GID

cp .env.alpha ./deploy/.env.api
cp ./services/web/.env ./deploy/.env.web
cp ./services/api/certs/*.crt ./deploy/certs/
cd ./deploy || return
docker compose up --build --force-recreate
docker compose down
cd ../ || return