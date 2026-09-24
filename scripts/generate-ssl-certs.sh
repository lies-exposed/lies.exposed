#!/usr/bin/env bash

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=liexp.dev' \
  -keyout liexp-dev-key.pem -out liexp-dev-cert.pem