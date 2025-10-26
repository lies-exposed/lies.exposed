#!/usr/bin/env bash

set -x -e

IMAGE_TAG=latest
BASE_IMAGE=ghcr.io/lies-exposed/liexp-base
API_IMAGE=ghcr.io/lies-exposed/liexp-api
BE_WORKER_IMAGE=ghcr.io/lies-exposed/liexp-worker
WEB_IMAGE=ghcr.io/lies-exposed/liexp-web
ADMIN_WEB_IMAGE=ghcr.io/lies-exposed/liexp-admin-web
AI_BOT_IMAGE=ghcr.io/lies-exposed/liexp-ai-bot
AGENT_IMAGE=ghcr.io/lies-exposed/liexp-agent

(exec ./scripts/docker-login.sh "$1")

base=false
api=false
be_worker=false
web=false
admin=false
ai_bot=false
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
        --base)
            base=true
            shift
            ;;
        --agent)
            agent=true
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
    docker image push $BASE_IMAGE:24-pnpm-latest
    docker image push $BASE_IMAGE:24-latest
fi

if [ "$api" = true ]; then
    echo "Pushing image $API_IMAGE"
    docker image push $API_IMAGE:$IMAGE_TAG
fi

if [ "$ai_bot" = true ]; then
    echo "Pushing image $AI_BOT_IMAGE"
    docker image push $AI_BOT_IMAGE:$IMAGE_TAG
fi

if [ "$be_worker" = true ]; then
    echo "Pushing image $BE_WORKER_IMAGE"
    docker image push "$BE_WORKER_IMAGE":$IMAGE_TAG
fi

if [ "$web" = true ]; then
    echo "Pushing image $WEB_IMAGE"
    docker image push $WEB_IMAGE:$IMAGE_TAG
fi

if [ "$admin" = true ]; then
    echo "Pushgin image $ADMIN_WEB_IMAGE"
    docker image push $ADMIN_WEB_IMAGE:$IMAGE_TAG
fi

if [ "$ai_bot" = true ]; then
    echo "Pushing image $AI_BOT_IMAGE"
    docker image push $AI_BOT_IMAGE:$IMAGE_TAG
fi

if [ "$agent" = true ]; then
    echo "Pushing image $AGENT_IMAGE"
    docker image push $AGENT_IMAGE:$IMAGE_TAG
fi
