#!/usr/bin/env bash

set -e -x

node --experimental-sea-config sea-config.json

cp $(command -v node) ./build/be-worker

strip ./build/be-worker

pnpx postject ./build/be-worker NODE_SEA_BLOB ./build/be-worker.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2