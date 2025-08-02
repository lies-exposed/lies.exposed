#!/usr/bin/env bash

ssh home.server "bash" << "EOF"
    set -x -e

    microk8s kubectl -n minio-operator get svc minio

    TENANT_NAME="microk8s"

    # microk8s kubectl get -n minio-operator secret $TENANT_NAME-env-configuration -o yaml
    microk8s kubectl get -n minio-operator secret $TENANT_NAME-env-configuration -o jsonpath='{.data.config\.env}' | base64 -d

    microk8s kubectl get -n minio-operator secret $TENANT_NAME-user-1 -o yaml
EOF

read -p 'MINIO ACCESS KEY: ' MINIO_ACCESS_KEY
read -p 'MINIO SECRET KEY: ' MINIO_SECRET_KEY

mc alias set space-lies-exposed https://space.lies.exposed $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
