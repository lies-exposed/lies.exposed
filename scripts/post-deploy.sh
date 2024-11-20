#!/usr/bin/env bash

# get host

HOST=$1

set -ex

# build setup
# cp ~/envs/.env ./.env
cp ~/envs/admin/.env ./services/admin-web/.env
# cp ~/envs/web/.env ./services/web/.env
# cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt

# install deps
pnpm install

export "NODE_OPTIONS=--max_old_space_size=4096"
export NODE_ENV=production

./scripts/docker-build.sh --ai-bot

# build packages
pnpm packages:build

# admin web
cd ./services/admin-web;
pnpm build:app
cd ../../;
sudo rm -rf "/var/www/html/${HOST}/admin/"
sudo mkdir -p "/var/www/html/${HOST}/admin/"
cp -r /root/node/app/current/services/admin-web/build/* "/var/www/html/${HOST}/admin/"

# build storybook
cd ./services/storybook;
pnpm build-sb
cd ../../;
sudo rm -rf "/var/www/html/${HOST}/storybook/"
sudo mkdir -p "/var/www/html/${HOST}/storybook/"
cp -r /root/node/app/current/services/storybook/build/* "/var/www/html/${HOST}/storybook/"

sudo chown -R www-data:www-data "/var/www/html/${HOST}"

# rm -rf /etc/nginx/sites-enabled/
cp /root/node/app/current/resources/nginx/alpha.lies.exposed.conf /etc/nginx/sites-enabled/alpha.lies.exposed.conf
cp /root/node/app/current/resources/nginx/telegram-bot-api.conf /etc/nginx/sites-enabled/telegram-bot-api.conf

# reload services
rm -rf ~/.pm2/pm2.log
rm -rf ~/.pm2/logs
sudo nginx -s reload
# pm2 restart ecosystem.config.js