#!/usr/bin/env bash

set -x

function login() {
    echo "$*"
    echo "$@";
    if [ -z "$*" ]; then
        echo "Pass username as first parameter"
        return 1
        exit 1
    else
        cat ./deploy/gh-token.txt | docker login ghcr.io -u "$1" --password-stdin
        return 0
    fi;
}



login $1