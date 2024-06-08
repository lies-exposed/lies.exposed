#!/usr/bin/env bash

set -e -x

ssh -t alpha.lies.exposed 'cd docker-app && docker compose --env-file .env.api run -d --rm --name db-dump api pnpm db:dump -p alpha'
