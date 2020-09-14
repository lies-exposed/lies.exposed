#!/bin/bash

set -x

NODE_ENV="production"

npm run clean

NODE_ENV=$NODE_ENV netlify build

netlify deploy --prod