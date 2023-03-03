#!/usr/bin/env bash

API_IMAGE=ghcr.io/lies-exposed/liexp-api:alpha-latest
WEB_IMAGE=ghcr.io/lies-exposed/liexp-web:alpha-latest


cat ./deploy/gh-token.txt | docker login ghcr.io -u $1 --password-stdin

docker build . --force-rm --pull --file api.Dockerfile --target production --tag $API_IMAGE
docker build . --force-rm --pull --file web.Dockerfile --target production --tag $WEB_IMAGE

docker image push $API_IMAGE
docker image push $WEB_IMAGE