#!/usr/bin/env bash

set -e -x
cp ~/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
cp ~/envs/web/.env ./services/web/.env
cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt
yarn
yarn packages:build
# NODE_ENV=production yarn admin-web build
mkdir -p /var/www/html/alpha.lies.exposed/admin
cp -r /root/node/app/current/services/admin-web/build/* /var/www/html/alpha.lies.exposed/admin
sudo chown -R www-data:www-data /var/www/html/alpha.lies.exposed
export NODE_ENV=production
yarn web build
yarn api build
yarn api migration:run
sudo nginx -s reload
pm2 reload ecosystem.config.js