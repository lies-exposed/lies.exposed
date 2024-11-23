#!/usr/bin/env bash

set -e -x

ssh -v -N alpha.lies.exposed -R 8008:localai.liexp.dev:8080 -C