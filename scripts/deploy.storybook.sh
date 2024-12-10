#!/usr/bin/env bash

set -e -x

HOST=$1

export VITE_NODE_ENV=production

rm -rf services/storybook/deploy
mkdir -p services/storybook/deploy

rm -rf services/admin-web/deploy

pnpm storybook build:app
pnpm storybook deploy --prod services/storybook/deploy

rsync -aP ./services/storybook/deploy/ $HOST:/var/www/html/${HOST}/storybook/

rm -rf services/storybook/deploy