#!/bin/sh

echo "Running database migrations..."
npm run migration:run

echo "Starting NestJS application..."
node dist/src/main
