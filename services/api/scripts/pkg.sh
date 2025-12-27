#!/usr/bin/env bash

set -e -x

node --experimental-sea-config sea-config.json

cp $(command -v node) ./build/api

strip ./build/api

pnpx postject ./build/api NODE_SEA_BLOB ./build/api.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
