#!/usr/bin/env bash

# install deps
pnpm install

scp ./services/web/.env.alpha "${SSH_HOST}":envs/web/.env
scp ./services/admin-web/.env.alpha "${SSH_HOST}":envs/admin/.env
scp ./services/api/.env.alpha "${SSH_HOST}":.env

# build packages

# pnpm packages:build

# admin web
# pnpm admin-web build
# rsync -P -a ./services/admin-web/build "${SSH_HOST}":~/node/app/current/services/admin-web/build

# web
# pnpm web build:app
# pnpm web build:server
# rsync -P -a ./services/web/build "${SSH_HOST}":~/node/app/current/services/web/build