#!/usr/bin/env bash

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
WEB_IMAGE=liexp-web

(exec ./scripts/docker-login.sh "$1")

# filter image to build based on parameter

base=false
pnpm=false
api=false
web=false

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
