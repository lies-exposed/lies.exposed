#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

ssh $SSH_DOMAIN "mkdir -p ~/docker-app/be-worker-temp"
ssh $SSH_DOMAIN "chown -R pptruser:pptruser ~/docker-app/be-worker-temp"

scp ./deploy/compose.yml $SSH_DOMAIN:docker-app/compose.yml
scp ./services/worker/.env.alpha $SSH_DOMAIN:docker-app/.env.be-worker


ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    cd ~/docker-app/

    chown -R pptruser:pptruser ./be-worker-temp

    docker compose --env-file .env.be-worker pull be-worker
    docker compose --env-file .env.be-worker up -d be-worker --force-recreate -V

EOF

