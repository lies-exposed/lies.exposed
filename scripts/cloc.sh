#!/usr/bin/env bash

set -e

function _cloc() {
    cloc $1 --exclude-dir node_modules,build,lib,coverage --exclude-ext json,ymal,yml,csv
    printf "\n"
}
packages=$(cd ./packages/@liexp && ls -d *)

for path in $packages
do
    echo "@liexp/$path"
    _cloc ./packages/@liexp/$path
done

services=$(cd ./services && ls -d *)
for path in $services
do
    echo "Service: $path"
    _cloc ./services/$path
done