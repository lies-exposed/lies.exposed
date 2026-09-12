#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <password>"
  exit 1
fi

node -e "
const crypto = require('crypto');
const password = process.argv[1];
const salt = crypto.randomBytes(16).toString('hex');
crypto.scrypt(password, salt, 64, (err, derivedKey) => {
  if (err) throw err;
  console.log(salt + ':' + derivedKey.toString('hex'));
});
" "$1"
