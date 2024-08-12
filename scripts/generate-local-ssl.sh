#!/usr/bin/env bash

set -e -x

openssl req -x509 -newkey rsa:4096 -keyout liexp.dev.key -out liexp.dev.crt -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=*.liexp.dev"

sudo mv liexp.dev.key liexp.dev.crt ./_data/certs/