#!/usr/bin/env bash

set -e -x

HOST=$1

export VITE_NODE_ENV=production

rm -rf services/admin-web/deploy
mkdir -p services/admin-web/deploy

pnpm admin-web build:app
pnpm admin-web deploy --prod services/admin-web/deploy

rsync -aP ./services/admin-web/deploy/ $HOST:/var/www/html/${HOST}/admin-web

rm -rf services/admin-web/deploy