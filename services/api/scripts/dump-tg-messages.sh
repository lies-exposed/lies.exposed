#!/usr/bin/env bash

set -ex

rsync -P -a alpha.lies.exposed:~/docker-app/temp/tg/messages/ ./temp/tg/messages
