#!/usr/bin/env bash

# build setup
cp ~/envs/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
cp ~/envs/web/.env ./services/web/.env
cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt

# install deps
yarn

export "NODE_OPTIONS=--max_old_space_size=4096"
export NODE_ENV=production

# admin web
mkdir -p "/var/www/html/${SSH_HOST}/admin"
cp -r /root/node/app/current/services/admin-web/build/* "/var/www/html/${SSH_HOST}/admin"
sudo chown -R www-data:www-data "/var/www/html/${SSH_HOST}"

# build packages
yarn packages:build

# api
yarn api build
yarn api migration:run
mkdir -p ./services/api/temp
mkdir -p ./services/api/temp/tg/messages

# reload services
sudo nginx -s reload
pm2 restart ecosystem.config.js