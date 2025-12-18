#!/usr/bin/env bash

set -e -x

HOST=k8s.lies.exposed

# reload services
ssh $HOST "cd lies-exposed && git pull origin main"
scp ./helm/values.prod.yaml $HOST:lies-exposed/helm/values.yaml
ssh $HOST "cd lies-exposed && ./scripts/helm/upgrade.sh"
