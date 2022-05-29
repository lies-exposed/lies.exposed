#!/usr/bin/env bash

docker-compose stop db
docker rm lies-exposed_db_1
docker volume rm lies-exposed_db-data
docker-compose up -d db
yarn api migration:run