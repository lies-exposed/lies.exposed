#!/usr/bin/env bash

set -e -x

rm -rf ./{build,deploy}
mkdir -p deploy/

pnpm build

pnpx esbuild \
	--format=cjs \
	--target=node20 \
	--platform=node \
	--bundle \
	--outfile=build/run-esbuild.js \
	build/run.js

node --experimental-sea-config sea-config.json

cp $(command -v node) ./deploy/ai-bot

pnpx postject ./deploy/ai-bot NODE_SEA_BLOB ./deploy/ai-bot.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2