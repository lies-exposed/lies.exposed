#!/usr/bin/env bash

set -e -x

SSH_HOST=${1:-"ssh.lies.exposed"}

export VITE_NODE_ENV=production

mv ./services/storybook/.env ./services/storybook/.env.dev
cp ./services/storybook/.env.prod ./services/storybook/.env

pnpm packages:build

pnpm storybook clean

pnpm storybook build:app

ssh "$SSH_HOST" "mkdir -p ~/lies-exposed/storybook/build"
ssh "$SSH_HOST" "mkdir -p ~/lies-exposed/storybook/logs"

ssh "$SSH_HOST" "rm -rf ~/lies-exposed/storybook/build"

rsync -aP ./services/storybook/build/ "$SSH_HOST":~/lies-exposed/storybook/build

pnpm storybook clean

rm ./services/storybook/.env
mv ./services/storybook/.env.dev ./services/storybook/.env


KUBECONFIG=$HOME/.kube/microk8s-local kubectl --namespace prod delete pod -l lies.exposed/name=storybook