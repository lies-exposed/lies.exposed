#!/usr/bin/env bash

set -ex

# start api with docker
docker compose up -d --wait liexp.dev

curl -f http://api.liexp.dev/v1/healthcheck
curl -f http://liexp.dev/healthcheck
