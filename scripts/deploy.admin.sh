#!/usr/bin/env bash
set -e -x

username=$1
export SSH_DOMAIN=${1:-"alpha.lies.exposed"}

scp ./deploy/compose.yml $SSH_DOMAIN:docker-app/compose.yml
scp ./services/admin-web/.env.prod $SSH_DOMAIN:docker-app/.env.admin-web
scp ./resources/nginx/alpha.admin.lies.exposed.conf $SSH_DOMAIN:docker-app/alpha.admin.lies.exposed.conf

ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    cd ~/docker-app/

    docker compose --env-file .env.admin-web pull admin-web
    docker compose --env-file .env.admin-web up -d admin-web --force-recreate -V

EOF

