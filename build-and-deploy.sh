#!/bin/bash

set -x

NODE_ENV="production"

NODE_ENV=$NODE_ENV netlify build

netlify deploy --prod