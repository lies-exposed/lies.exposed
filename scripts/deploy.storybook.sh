#!/usr/bin/env bash

set -e -x

HOST=${1:-"alpha.lies.exposed"}

export VITE_NODE_ENV=production

pnpm storybook clean

pnpm storybook build:app

ssh "$HOST" "rm -rf /var/www/html/${HOST}/storybook"

rsync -aP ./services/storybook/build/ "$HOST":/var/www/html/"${HOST}"/storybook

pnpm storybook clean