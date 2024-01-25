#!/usr/bin/env bash

set -e -x

ssh -t alpha.lies.exposed tail -f /var/log/nginx/$1
