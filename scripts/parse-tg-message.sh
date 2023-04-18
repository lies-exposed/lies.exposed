#!/usr/bin/env bash

set -e -x

export SSH_DOMAIN=alpha.lies.exposed


ssh $SSH_DOMAIN "bash" << "EOF"
    set -x -e

    cd ~/docker-app/

    docker compose run --rm api yarn parse-tg-message latest true
EOF

