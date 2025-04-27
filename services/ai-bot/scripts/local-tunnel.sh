#!/usr/bin/env bash

set -e -x

ssh -v -N alpha.lies.exposed -R 8008:127.0.0.1:8080 -C