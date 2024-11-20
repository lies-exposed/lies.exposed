#!/usr/bin/env bash

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
WEB_IMAGE=liexp-web
AI_BOT_IMAGE=liexp-ai-bot

(exec ./scripts/docker-login.sh "$1")

# filter image to build based on parameter

base=false
pnpm=false
api=false
web=false
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
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:20-pnpm-latest \
    --target=pnpm
fi

if [ "$base" = true ]; then
  docker build . --force-rm --pull --file base.Dockerfile \
    --tag $BASE_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:20-latest \
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
