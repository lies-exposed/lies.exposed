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

    docker compose --env-file .env.be-worker run -d --rm --name upsert-nlp-entities be-worker pnpm bin:run upsert-nlp-entities
    docker compose --env-file .env.be-worker run -d --rm --name upsert-tg-pinned-message be-worker pnpm bin:run upsert-tg-pinned-message
    docker compose --env-file .env.be-worker run -d --rm --name parse-all-tg-messages be-worker pnpm bin:run parse-tg-message all true
    docker compose --env-file .env.be-worker run -d --rm --name clean-space-media be-worker pnpm bin:run clean-space-media --dry
    docker compose --env-file .env.be-worker run -d --rm --name extract-actor-and-group-avatar be-worker pnpm bin:run extract-actor-and-group-avatar
    docker compose --env-file .env.be-worker run -d --rm --name assign-default-area-featured-image be-worker pnpm bin:run assign-default-area-featured-image

EOF

