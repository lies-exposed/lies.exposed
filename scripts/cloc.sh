#!/usr/bin/env bash

set -e

function _cloc() {
    cloc $1 --exclude-dir node_modules,build,lib,coverage --exclude-ext json,ymal,yml,csv
    printf "\n"
}
packages=$(ls -d ./packages/@liexp/*)

for path in $packages
do
    echo "@liexp/$path"
    _cloc $path
done

services=$(ls -d ./services/*)
for path in $services
do
    echo "Service: $path"
    _cloc $path
done

_cloc "$packages $services"