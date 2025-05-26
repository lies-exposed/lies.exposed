#!/usr/bin/env bash

set -e -x

HOST=${1:-"alpha.lies.exposed"}

pnpm admin-web clean

pnpm packages:build

export VITE_NODE_ENV=production
export DOTENV_CONFIG_PATH=".env.alpha"

pnpm admin-web build:app

ssh "$HOST" "rm -rf /var/www/html/${HOST}/admin-web"

rsync -arP ./services/admin-web/build/ "$HOST":/var/www/html/"${HOST}"/admin

pnpm admin-web clean
