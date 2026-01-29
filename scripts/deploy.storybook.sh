#!/usr/bin/env bash

set -e -x

SSH_HOST=${1:-"ssh.lies.exposed"}

export VITE_NODE_ENV=production

mv ./services/storybook/.env ./services/storybook/.env.dev
cp ./services/storybook/.env.prod ./services/storybook/.env

pnpm packages build

pnpm storybook clean

pnpm storybook build:app

mc mirror --overwrite --remove \
    services/storybook/build \
    lies-exposed-space/storybook

mv ./services/storybook/.env.dev ./services/storybook/.env
