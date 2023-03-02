#!/usr/bin/env bash

API_IMAGE=ghcr.io/lies-exposed/liexp-web:alpha-latest
WEB_IMAGE=ghcr.io/lies-exposed/liexp-web:alpha-latest


cat ./deploy/gh-token.txt | docker login ghcr.io -u $1 --password-stdin

docker build . --file api.Dockerfile --target production --tag $API_IMAGE
docker build . --file web.Dockerfile --target production --tag $WEB_IMAGE

docker push $API_IMAGE
docker push $WEB_IMAGE