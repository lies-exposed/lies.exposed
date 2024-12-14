#!/usr/bin/env bash

set -e -x

HOST=${1:-"alpha.lies.exposed"}

export VITE_NODE_ENV=production

pnpm storybook clean

pnpm storybook build:app

pnpm storybook deploy --prod services/storybook/deploy

ssh $HOST "rm -rf /var/www/html/${HOST}/storybook"

rsync -aP ./services/storybook/deploy/ $HOST:/var/www/html/${HOST}/storybook

rm -rf services/storybook/deploy