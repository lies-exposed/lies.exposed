#!/usr/bin/env bash

set -e -x

# build setup
cp ~/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
cp ~/envs/web/.env ./services/web/.env
cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt

# install deps
yarn

# build packages
yarn packages:build

# admin web
# NODE_ENV=production yarn admin-web build
mkdir -p /var/www/html/alpha.lies.exposed/admin
cp -r /root/node/app/current/services/admin-web/build/* /var/www/html/alpha.lies.exposed/admin
sudo chown -R www-data:www-data /var/www/html/alpha.lies.exposed
# web
export NODE_ENV=production
yarn api build
yarn api migration:run
yarn web build

# reload services
sudo nginx -s reload
pm2 reload ecosystem.config.js