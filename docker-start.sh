#!/bin/sh
# Container start: run the app at once; migrate and add the first owner alongside it
set -e

db_setup() {
  node db-migrate.cjs || { echo "Database setup failed: the app is running, but fix DATABASE_URL or RDS access and restart."; return 1; }
  # Setup needs FIRST_OWNER_*; once an owner exists they can be removed
  if [ -n "$FIRST_OWNER_EMAIL" ]; then
    node db-setup.cjs
  else
    echo "FIRST_OWNER_EMAIL is not set: skipping first-owner setup."
  fi
}

if [ "$DB_SETUP_ON_START" = "false" ]; then
  echo "DB_SETUP_ON_START=false: skipping migrations and setup."
else
  # In the background so health checks get an answer while the database is slow or down
  db_setup &
fi

exec node server.js
