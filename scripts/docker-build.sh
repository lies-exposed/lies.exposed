#!/usr/bin/env bash

BASE_IMAGE=liexp-base
API_IMAGE=liexp-api
WEB_IMAGE=liexp-web

(exec ./scripts/docker-login.sh "$1")

docker build . --force-rm --pull --file base.Dockerfile \
    --tag $BASE_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$BASE_IMAGE:20-latest

docker build . --force-rm --pull --file api.Dockerfile \
    --target production \
    --tag $API_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$API_IMAGE:alpha-latest

docker build --build-arg DOTENV_CONFIG_PATH=.env.alpha . \
    --force-rm \
    --pull \
    --file web.Dockerfile \
    --target production \
    --tag $WEB_IMAGE:alpha-latest \
    --tag ghcr.io/lies-exposed/$WEB_IMAGE:alpha-latest
