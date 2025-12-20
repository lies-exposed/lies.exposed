#!/usr/bin/env bash

set -x

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
BE_WORKER_IMAGE=liexp-worker
ADMIN_WEB_IMAGE=liexp-admin-web
WEB_IMAGE=liexp-web
AI_BOT_IMAGE=liexp-ai-bot
AGENT_IMAGE=liexp-agent

# filter image to build based on parameter

base=false
pnpm=false
api=false
be_worker=false
web=false
ai_bot=false
admin=false
agent=false

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --api)
            api=true
            shift
            ;;
        --be-worker)
            be_worker=true
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
        --agent)
            agent=true
            shift
            ;;
        --base)
            base=true
            shift
            ;;
        --pnpm)
            pnpm=true
            shift
            ;;
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

if [ "$pnpm" = true ]; then
  docker build . --force-rm --pull --file base.Dockerfile \
    --tag $BASE_IMAGE:pnpm-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:24-pnpm-latest \
    --target=pnpm \
    "${other_args[@]}"
fi

if [ "$base" = true ]; then
  docker build . --force-rm --pull --file base.Dockerfile --no-cache \
    --tag $BASE_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:24-latest \
    --target=api-base \
    "${other_args[@]}"
fi

if [ "$admin" = true ]; then
  docker build \
    --build-arg DOTENV_CONFIG_PATH=.env.prod \
    --file adminWeb.Dockerfile \
    --target production \
    --tag $ADMIN_WEB_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$ADMIN_WEB_IMAGE:latest \
    . \
    "${other_args[@]}"
fi

if [ "$ai_bot" = true ]; then
  docker build . \
    --force-rm \
    --file ai-bot.Dockerfile \
    --target production \
    --tag $AI_BOT_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$AI_BOT_IMAGE:latest \
    "${other_args[@]}"
fi

if [ "$api" = true ]; then
  docker build . \
    --force-rm \
    --file api.Dockerfile \
    --target production \
    --tag $API_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$API_IMAGE:latest \
    "${other_args[@]}"
fi

if [ "$be_worker" = true ]; then
  docker build . \
    --force-rm \
    --file worker.Dockerfile \
    --target production \
    --tag $API_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$BE_WORKER_IMAGE:latest \
    "${other_args[@]}"
fi

if [ "$agent" = true ]; then
  docker build . \
    --force-rm \
    --file agent.Dockerfile \
    --target production \
    --tag $AGENT_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$AGENT_IMAGE:latest \
    "${other_args[@]}"
fi

if [ "$web" = true ]; then
  docker build . \
    --build-arg DOTENV_CONFIG_PATH=".env.prod" \
    --force-rm \
    --file web.Dockerfile \
    --target production \
    --tag $WEB_IMAGE:latest \
    --tag ghcr.io/lies-exposed/$WEB_IMAGE:latest \
    "${other_args[@]}"
fi
