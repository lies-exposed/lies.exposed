#!/usr/bin/env bash

set -x -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR" || exit

# Upgrade infrastructure with Helm
sh ./scripts/helm/upgrade.sh

# Restart deployments with kubectl
sh ./scripts/kubectl/rollout-restart.sh
