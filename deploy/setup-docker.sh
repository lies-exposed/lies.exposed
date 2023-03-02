#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

scp -r ./deploy/nginx $SSH_DOMAIN:/root/
scp ./deploy/gh-token.txt $SSH_DOMAIN:docker-app/gh-token.txt
scp .env.alpha $SSH_DOMAIN:docker-app/.env.api
scp ./services/web/.env.alpha $SSH_DOMAIN:docker-app/.env.web
scp ./deploy/docker-compose.yml $SSH_DOMAIN:docker-app/docker-compose.yml
scp -r ./services/api/certs/ $SSH_DOMAIN:docker-app/certs/

ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -x
    u=$1
    cd ~/docker-app/
    cat ./gh-token.txt | docker login ghcr.io -u $u --password-stdin
    rm ./gh-token.txt
    docker-compose pull
    docker-compose up --force-recreate -d
    docker rm api-migration
    docker-compose run --name api-migration api yarn migration:run
EOF

