#!/usr/bin/env bash

set -e -x

pnpm pack

npm install -g liexp-ai-bot-*.tgz