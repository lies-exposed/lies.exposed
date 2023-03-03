#!/usr/bin/env bash

# get host

HOST=$1

set -ex

# build setup
cp ~/envs/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
# cp ~/envs/web/.env ./services/web/.env
# cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt

# install deps
yarn

yarn clean

export "NODE_OPTIONS=--max_old_space_size=4096"
export NODE_ENV=production


# build packages
yarn packages:build

# admin web
# mkdir -p "/var/www/html/${HOST}/admin"
cd ./services/admin-web;
yarn build:app
cd ../../;
cp -r /root/node/app/current/services/admin-web/build/* "/var/www/html/${HOST}/admin/"
sudo chown -R www-data:www-data "/var/www/html/${HOST}"

# web
# cd ./services/web;
# yarn build:app
# yarn build:server
# cd ../../;

# api
# cd ./services/api;
# mkdir -p ./services/api/temp
# mkdir -p ./services/api/temp/tg/messages
# yarn build
# yarn migration:run
# DOTENV_CONFIG_PATH=../../.env yarn upsert-nlp-entities
# cd ../../;

# reload services
sudo nginx -s reload
# pm2 restart ecosystem.config.js