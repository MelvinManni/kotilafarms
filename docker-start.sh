#!/bin/sh
# Container start: migrate, add the first owner and fixed lists, then run the app
set -e

if [ "$DB_SETUP_ON_START" = "false" ]; then
  echo "DB_SETUP_ON_START=false: skipping migrations and setup."
else
  node db-migrate.cjs
  # Setup needs FIRST_OWNER_*; once an owner exists they can be removed
  if [ -n "$FIRST_OWNER_EMAIL" ]; then
    node db-setup.cjs
  else
    echo "FIRST_OWNER_EMAIL is not set: skipping first-owner setup."
  fi
fi

exec node server.js
