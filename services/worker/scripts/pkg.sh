#!/usr/bin/env bash

set -e -x

node --experimental-sea-config sea-config.json

cp $(command -v node) ./build/be-worker

strip ./build/be-worker

pnpx postject ./build/be-worker NODE_SEA_BLOB ./build/be-worker.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

cp ../../node_modules/jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js ./build/xhr-sync-worker.js

cp ../../node_modules/pdfjs-dist/build/pdf.worker.mjs ./build/pdf.worker.mjs