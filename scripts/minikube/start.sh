#!/usr/bin/env bash

set -e -x

PATH=${PATH:-"$HOME/Workspace/lies-exposed/"}

minikube start \
    --namespace liexp-dev \
    --kubernetes-version=v1.33.1 \
    --mount-string "$PATH:/home/node/" \
    --mount

minikube addons enable ingress
# minikube addons enable ingress-dns
