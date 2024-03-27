#!/usr/bin/env bash

set -x -e

IMAGE_TAG=alpha-latest
BASE_IMAGE=ghcr.io/lies-exposed/liexp-base
API_IMAGE=ghcr.io/lies-exposed/liexp-api
WEB_IMAGE=ghcr.io/lies-exposed/liexp-web

(exec ./scripts/docker-login.sh "$1")

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
    echo "Pushing image $BASE_IMAGE"
    docker image push $BASE_IMAGE:20-latest
fi

if [ "$api" = true ]; then
    echo "Pushing image $API_IMAGE"
    docker image push $API_IMAGE:$IMAGE_TAG
fi

if [ "$web" = true ]; then
    echo "Pushing image $WEB_IMAGE"
    docker image push $WEB_IMAGE:$IMAGE_TAG
fi