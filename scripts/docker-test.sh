#!/usr/bin/env bash

set -e -x

docker compose build api
docker compose up -d db
docker compose up --force-recreate -d api

sleep 20

curl http://localhost:4010/v1/healthcheck