#!/usr/bin/env bash

set -ex

# start api with docker
docker compose up -d --wait liexp.dev api.liexp.dev

curl --cacert ./_data/certs/liexp.dev.crt -f https://api.liexp.dev/v1/healthcheck
curl --cacert ./_data/certs/liexp.dev.crt -f https://liexp.dev/healthcheck
