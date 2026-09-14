#!/bin/bash
# Creates one Postgres database per entry in POSTGRES_MULTIPLE_DATABASES
# (comma-separated), each owned by POSTGRES_USER. Runs automatically on
# first container start because Postgres' base image executes every
# /docker-entrypoint-initdb.d/*.sh script against a fresh data directory.
set -e
set -u

function create_database() {
	local database=$1
	echo "Creating database '$database' owned by '$POSTGRES_USER'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    SELECT 'CREATE DATABASE "$database" OWNER "$POSTGRES_USER"'
	    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	IFS=',' read -ra DATABASES <<< "$POSTGRES_MULTIPLE_DATABASES"
	for db in "${DATABASES[@]}"; do
		create_database "$db"
	done
	echo "Multiple databases created"
fi
