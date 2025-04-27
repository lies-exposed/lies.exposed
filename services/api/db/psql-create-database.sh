#!/bin/bash

set -e -x


function create_user_and_database() {
	local database=$1
	echo "Creating database '$database' user through '$POSTGRES_USER'"

	psql -vv ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tc "CREATE DATABASE $database;"
	psql -vv ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tc "GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;"
}

if [ -n "$DBS" ]; then
	IFS=',' read -ra DB_NAMES <<< "$DBS"
	echo "Multiple database creation requested: ${DB_NAMES[*]}"
	for db in "${DB_NAMES[@]}"
	do
		create_user_and_database $db
	done
	echo "Multiple databases created"
fi