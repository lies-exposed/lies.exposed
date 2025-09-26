#!/usr/bin/env bash

set -ex

rsync -P -a ssh.lies.exposed:~/lies-exposed/db/dump/ ./db/dump/