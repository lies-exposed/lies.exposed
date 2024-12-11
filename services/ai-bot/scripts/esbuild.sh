#!/usr/bin/env bash

set -e -x

package_manager="${1:-"pnpx"}"

$package_manager esbuild \
	--format=cjs \
	--target=node20 \
	--platform=node \
	--bundle \
	--outfile=build/run-esbuild.js \
	build/run.js