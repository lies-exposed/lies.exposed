#!/usr/bin/env bash

set -e -x

HOST=$1

export VITE_NODE_ENV=production

pnpm admin-web clean

pnpm admin-web build:app
pnpm admin-web deploy --prod services/admin-web/deploy

rsync -aP ./services/admin-web/deploy/ $HOST:/var/www/html/${HOST}/admin-web

pnpm admin-web clean