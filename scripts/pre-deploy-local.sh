#!/usr/bin/env bash

# clean output dirs
yarn clean

# install deps
yarn

export NODE_ENV=production

scp ./services/web/.env.alpha "${SSH_HOST}":envs/web/.env
scp ./services/admin-web/.env.alpha "${SSH_HOST}":envs/admin/.env
scp .env.alpha "${SSH_HOST}":envs/.env

# build packages

yarn packages:build

# admin web
yarn admin-web build
rsync -P -a ./services/admin-web/build "${SSH_HOST}":~/node/app/current/services/admin-web/build

# web
yarn web build:app
yarn web build:server
rsync -P -a ./services/web/build "${SSH_HOST}":~/node/app/current/services/web/build