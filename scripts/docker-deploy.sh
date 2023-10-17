#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

scp -r ./deploy/nginx $SSH_DOMAIN:/root/
scp ./deploy/gh-token.txt $SSH_DOMAIN:docker-app/gh-token.txt
scp ./services/api/.env.alpha $SSH_DOMAIN:docker-app/.env.api
scp ./services/web/.env.alpha $SSH_DOMAIN:docker-app/.env.web
scp ./deploy/docker-compose.yml $SSH_DOMAIN:docker-app/docker-compose.yml
scp -r ./services/api/certs/ $SSH_DOMAIN:docker-app/certs/
scp -r ./services/api/config/ $SSH_DOMAIN:docker-app/config/

ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -x -e
    u=$1
    cd ~/docker-app/
    cat ./gh-token.txt | docker login ghcr.io -u $u --password-stdin
    rm ./gh-token.txt

    rm -rf ./temp
    mkdir -p ./config/nlp
    mkdir -p ./temp/networks/keywords
    mkdir -p ./temp/networks/actors
    mkdir -p ./temp/networks/groups
    mkdir -p ./temp/networks/events
    mkdir -p ./temp/tg/messages
    mkdir -p ./temp/media

    chown -R pptruser:pptruser ./config
    chown -R pptruser:pptruser ./temp
    export API_UID=$(id pptruser -u)
    export API_GID=$(id pptruser -g)
    docker compose --env-file .env.api pull
    docker compose --env-file .env.api up --build --force-recreate -d --wait
    docker system prune -f
    docker builder prune -f --all
    docker compose run --name api-migration api yarn migration:run > migration.txt
    docker compose run -d --rm --name upsert-nlp-entities api yarn ts:node:build ./bin/upsert-nlp-entities.ts
    docker compose run -d --rm --name upsert-tg-pinned-message api yarn upsert-tg-pinned-message
    docker compose run -d --rm --name parse-all-tg-messages api yarn parse-tg-message all true

    cd ~/
    # list top 5 bigger files
    find -type f -exec du -Sh {} + | sort -rh | head -n 5
EOF

