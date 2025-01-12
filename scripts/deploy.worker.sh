#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

pnpm worker build

ssh $SSH_DOMAIN "mkdir -p ~/docker-app/be-worker-temp"
ssh $SSH_DOMAIN "chown -R pptruser:pptruser ./be-worker-temp"

scp ./deploy/compose.yml $SSH_DOMAIN:docker-app/compose.yml

scp ./services/worker/.env.alpha $SSH_DOMAIN:docker-app/.env.worker


ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    cd ~/docker-app/

    chown -R pptruser:pptruser ./be-worker-temp

    docker compose pull be-worker
    docker compose up -d be-worker --force-recreate -V

EOF

