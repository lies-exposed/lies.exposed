#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

scp ./deploy/gh-token.txt $SSH_DOMAIN:docker-app/gh-token.txt
scp ./deploy/ai-bot.config.json $SSH_DOMAIN:docker-app/ai-bot.config.json
scp ./deploy/compose.yml $SSH_DOMAIN:docker-app/compose.yml

scp -r ./deploy/certs/ $SSH_DOMAIN:docker-app/certs/
mkdir -p ./services/api/config/
scp -r ./services/api/config $SSH_DOMAIN:docker-app/

scp -r ./resources/nginx/snippets/ssl-params.conf $SSH_DOMAIN:/etc/nginx/snippets/ssl-params.conf
scp -r ./resources/nginx/alpha.lies.exposed.conf $SSH_DOMAIN:/etc/nginx/sites-enabled/alpha.lies.exposed.conf
scp -r ./resources/nginx/alpha.api.lies.exposed.conf $SSH_DOMAIN:/etc/nginx/sites-enabled/alpha.api.lies.exposed.conf
scp -r ./resources/nginx/telegram-bot-api.conf $SSH_DOMAIN:/etc/nginx/sites-enabled/telegram-bot-api.conf

scp ./services/api/.env.prod $SSH_DOMAIN:docker-app/.env.api
scp ./services/web/.env.prod $SSH_DOMAIN:docker-app/.env.web
scp ./services/admin-web/.env.prod $SSH_DOMAIN:docker-app/.env.admin-web
scp ./services/ai-bot/.env.prod $SSH_DOMAIN:docker-app/.env.ai-bot
scp ./services/worker/.env.prod $SSH_DOMAIN:docker-app/.env.be-worker

ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    # nginx -t

    usermod -aG systemd-journal www-data

    cd ~/docker-app/
    cat ./gh-token.txt | docker login ghcr.io -u $u --password-stdin
    rm ./gh-token.txt

    mkdir -p /var/lib/telegram-bot-api
    chown -R 101:101 /var/lib/telegram-bot-api

    rm -rf ./temp/media
    rm -rf ./temp/nlp
    rm -rf ./temp/urls

    mkdir -p ./config/nlp
    mkdir -p ./temp/networks/keywords
    mkdir -p ./temp/networks/actors
    mkdir -p ./temp/networks/groups
    mkdir -p ./temp/networks/events
    mkdir -p ./temp/tg/messages
    mkdir -p ./temp/media
    mkdir -p ./temp/queue
    mkdir -p ./redis-data
    mkdir -p ./ai-bot-temp

    chown -R pptruser:pptruser ./config
    chown -R pptruser:pptruser ./temp
    chown -R pptruser:pptruser ./ai-bot-temp

    export API_UID=$(id pptruser -u)
    export API_GID=$(id pptruser -g)

    docker compose --env-file .env.api pull api web redis
    docker compose --env-file .env.api up --build --force-recreate -d --wait api redis
    docker compose --env-file .env.web up --build --force-recreate -d --wait --no-deps web

    docker system prune -f
    docker builder prune -f --all

    docker compose --env-file .env.api run -d --name api-migration api npx typeorm migration:run -d ./ormconfig.js


    cd ~/
    # list top 5 bigger files
    find -type f -exec du -Sh {} + | sort -rh | head -n 5

EOF

