#!/usr/bin/env bash

set -e -x

HOST=alpha.lies.exposed

username=$1

admin=false
storybook=false
ai_bot=false

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --admin)
            admin=true
            shift
            ;;
        --ai-bot)
            ai_bot=true
            shift
            ;;
        --storybook)
            storybook=true
            shift
            ;;
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

if [ "$admin" = true ]; then
    # deploy admin-web
    ./scripts/deploy.admin.sh $HOST
fi

if [ "$ai_bot" = true ]; then
    # deploy ai-bot
    cd ./services/ai-bot
    ./scripts/pkg.sh
    ./scripts/deploy.ai-bot.sh $HOST
    cd ../..
fi

if [ "$storybook" = true ]; then
    # deploy ai-bot
    ./scripts/deploy.storybook.sh $HOST
fi

./scripts/docker-deploy.sh $HOST "$username"