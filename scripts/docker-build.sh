#!/usr/bin/env bash

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
WEB_IMAGE=liexp-web

(exec ./scripts/docker-login.sh "$1")

# filter image to build based on parameter

base=false
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
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

if [ "$base" = true ]; then
  docker build . --force-rm --pull --file base.Dockerfile \
    --tag $BASE_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:20-latest
fi

if [ "$api" = true ]; then
  docker build . \
    --force-rm \
    --pull \
    --no-cache \
    --file api.Dockerfile \
    --target production \
    --tag $API_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$API_IMAGE:alpha-latest
fi

if [ "$web" = true ]; then
  docker build . \
    --force-rm \
    --pull \
    --no-cache \
    --file web.Dockerfile \
    --target production \
    --tag $WEB_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$WEB_IMAGE:alpha-latest
fi
