#!/usr/bin/env bash

set -e -x

HOST=alpha.lies.exposed

username=$1

api=false
web=false
tg_bot=false
admin=false
storybook=false
ai_bot=false

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --api)
            api=true
            shift
            ;;
        --web)
            web=true
            shift
            ;;
        --admin)
            admin=true
            shift
            ;;
        --ai-bot)
            ai_bot=true
            shift
            ;;
        --tg-bot)
            tg_bot=true
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

# build packages if we are deploying admin or storybook
if [ "$admin" = true ] || [ "$storybook" = true ]; then
    pnpm packages:build
fi

if [ "$admin" = true ]; then
    # deploy admin-web
    ./scripts/deploy.admin.sh $HOST
fi

if [ "$storybook" = true ]; then
    # deploy ai-bot
    ./scripts/deploy.storybook.sh $HOST
fi

if [ "$ai_bot" = true ]; then
    # deploy ai-bot
    ./scripts/deploy.ai-bot.sh $HOST
fi

if [ "$admin" = true ] || [ "$storybook" = true ]; then
    ssh $HOST "sudo chown -R www-data:www-data '/var/www/html/${HOST}'"
fi

if [ "$api" = true ] || [ "$web" = true ] || [ "$tg_bot" = true ]; then
    # deploy docker
    ./scripts/docker-deploy.sh $HOST "$username"
fi

# reload services
ssh $HOST "sudo nginx -s reload"
