#!/usr/bin/env bash

set -e -x

ssh -N alpha.lies.exposed -R 8080:localhost:8080 -C