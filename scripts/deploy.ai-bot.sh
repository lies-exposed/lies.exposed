#!/usr/bin/env bash

set -e -x

username=$1
export SSH_DOMAIN=alpha.lies.exposed

scp ./deploy/ai-bot.config.json $SSH_DOMAIN:docker-app/ai-bot.config.json

scp ./services/ai-bot/.env.alpha $SSH_DOMAIN:docker-app/.env.ai-bot

scp ./services/ai-bot/deploy/ai-bot $SSH_DOMAIN:docker-app/ai-bot


ssh $SSH_DOMAIN "bash -s $username" << "EOF"
    set -e
    u=$1

    # nginx -t

    cd ~/docker-app/
    mkdir -p ./ai-bot-temp

    chown -R pptruser:pptruser ./ai-bot-temp

EOF

