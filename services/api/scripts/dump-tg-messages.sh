#!/usr/bin/env bash

set -ex

rsync -P -a alpha.lies.exposed:~/node/app/current/services/api/temp/tg/messages/ ./services/api/temp/tg/messages
