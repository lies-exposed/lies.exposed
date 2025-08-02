#!/usr/bin/env bash

set -ex

# Load environment variables
source .env.prod

user=$DB_USERNAME
password=$DB_PASSWORD
port=$DB_PORT
host=$DB_HOST
dbname=$DB_DATABASE

ssh alpha.lies.exposed "user=$user password=$password port=$port host=$host dbname=$dbname bash" << 'EOF'
    set -e
    connect_timeout=30
    sslmode="verify-ca"
    sslrootcert="certs/dev-certificate.crt"

    mkdir -p ./dump/

    now=$(date '+%m-%d-%YT%H:%M:%S')

    pg_dump "user=$user password=$password port=$port host=$host dbname=$dbname connect_timeout=$connect_timeout sslmode=$sslmode sslrootcert=$HOME/$sslrootcert" -v -O --file ./dump/alpha-$now.sql

EOF


rsync -P -a alpha.lies.exposed:~/dump/ ./db/dump/