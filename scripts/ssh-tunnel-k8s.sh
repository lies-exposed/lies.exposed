#!/usr/bin/env bash

set -e -x

ssh -v -N k8s.lies.exposed -L 6443:127.0.0.1:6443 -C

# sshuttle -r k8s.lies.exposed -x k8s.lies.exposed:22 0/0

