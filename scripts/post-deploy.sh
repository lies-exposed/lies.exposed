#!/usr/bin/env bash

# build setup
cp ~/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
cp ~/envs/web/.env ./services/web/.env
cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt

# install deps
yarn

export "NODE_OPTIONS=--max_old_space_size=4096"
export NODE_ENV=production

# build packages
yarn packages:build

# admin web
DEBUG="@liexp*" yarn admin-web build
mkdir -p /var/www/html/alpha.lies.exposed/admin
cp -r /root/node/app/current/services/admin-web/build/* /var/www/html/alpha.lies.exposed/admin
sudo chown -R www-data:www-data /var/www/html/alpha.lies.exposed

# api
yarn api build
yarn api migration:run

# web
DEBUG="@liexp*" yarn web build

# reload services
sudo nginx -s reload
pm2 restart ecosystem.config.js