#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

pnpm ai-bot build

ssh $SSH_DOMAIN "rm -rf ~/docker-app/services/ai-bot/build"
ssh $SSH_DOMAIN "mkdir -p ~/docker-app/services/ai-bot/build"

scp ./deploy/compose.yml $SSH_DOMAIN:docker-app/compose.yml
scp ./deploy/ai-bot.config.json $SSH_DOMAIN:docker-app/ai-bot.config.json

scp ./ai-bot.Dockerfile $SSH_DOMAIN:docker-app/ai-bot.Dockerfile

scp ./services/ai-bot/.env.alpha $SSH_DOMAIN:docker-app/.env.ai-bot
scp ./services/ai-bot/build/run-esbuild.js $SSH_DOMAIN:docker-app/services/ai-bot/build/
scp ./services/ai-bot/build/ai-bot.blob $SSH_DOMAIN:docker-app/services/ai-bot/build/
ssh $SSH_DOMAIN "ls -la ~/docker-app/services/ai-bot/build/"
scp ./services/ai-bot/sea-config.json $SSH_DOMAIN:docker-app/services/ai-bot/sea-config.json


ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    cd ~/docker-app/
    mkdir -p ./ai-bot-temp

    chown -R pptruser:pptruser ./ai-bot-temp

    docker compose build ai-bot
    docker compose up -d ai-bot

EOF

