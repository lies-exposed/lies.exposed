#!/usr/bin/env bash

set -x

mc admin user add local space-access-key-id space-access-key-secret-id
mc admin policy attach local readwrite --user=space-access-key-id