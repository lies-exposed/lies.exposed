#!/usr/bin/env bash

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
BE_WORKER_IMAGE=liexp-worker
WEB_IMAGE=liexp-web
AI_BOT_IMAGE=liexp-ai-bot

(exec ./scripts/docker-login.sh "$1")

# filter image to build based on parameter

base=false
pnpm=false
api=false
worker=false
web=false
ai_bot=false

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --api)
            api=true
            shift
            ;;
        --be-worker)
            worker=true
            shift
            ;;
        --web)
            web=true
            shift
            ;;
        --ai-bot)
            ai_bot=true
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
    --tag $BASE_IMAGE:alpha-pnpm-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:23-pnpm-latest \
    --target=pnpm
fi

if [ "$base" = true ]; then
  docker build . --force-rm --pull --file base.Dockerfile --no-cache \
    --tag $BASE_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:23-latest \
    --target=api-base
fi

if [ "$ai_bot" = true ]; then
  docker build . \
    --force-rm \
    --no-cache \
    --file ai-bot.Dockerfile \
    --target production \
    --tag $AI_BOT_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$AI_BOT_IMAGE:alpha-latest
fi

if [ "$api" = true ]; then
  docker build . \
    --force-rm \
    --no-cache \
    --file api.Dockerfile \
    --target production \
    --tag $API_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$API_IMAGE:alpha-latest
fi

if [ "$worker" = true ]; then
  docker build . \
    --force-rm \
    --no-cache \
    --file worker.Dockerfile \
    --target production \
    --tag $API_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$BE_WORKER_IMAGE:alpha-latest
fi

if [ "$web" = true ]; then
  docker build . \
    --force-rm \
    --no-cache \
    --file web.Dockerfile \
    --target production \
    --build-arg DOTENV_CONFIG_PATH=.env.alpha \
    --tag $WEB_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$WEB_IMAGE:alpha-latest
fi
