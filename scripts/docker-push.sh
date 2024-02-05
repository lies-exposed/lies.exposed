#!/usr/bin/env bash

set -x -e

IMAGE_TAG=alpha-latest
BASE_IMAGE=ghcr.io/lies-exposed/liexp-base
API_IMAGE=ghcr.io/lies-exposed/liexp-api
WEB_IMAGE=ghcr.io/lies-exposed/liexp-web

(exec ./scripts/docker-login.sh "$1")

echo "Pushing image $BASE_IMAGE"
docker image push $BASE_IMAGE:20-latest

echo "Pushing image $API_IMAGE:$IMAGE_TAG"
docker image push $API_IMAGE:$IMAGE_TAG

echo "Pushing image $WEB_IMAGE:$IMAGE_TAG"
docker image push $WEB_IMAGE:$IMAGE_TAG