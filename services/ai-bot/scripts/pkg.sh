#!/usr/bin/env bash

set -e -x

node --experimental-sea-config sea-config.json

cp $(command -v node) ./build/ai-bot

strip ./build/ai-bot

pnpx postject ./build/ai-bot NODE_SEA_BLOB ./build/ai-bot.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2