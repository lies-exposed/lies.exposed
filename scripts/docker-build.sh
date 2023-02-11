#!/usr/bin/env bash

docker build . --file api.Dockerfile --pull --target production --tag liexp-api:alpha
docker build . --file web.Dockerfile --pull --target production --tag liexp-web:alpha