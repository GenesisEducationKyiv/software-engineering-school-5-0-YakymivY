#!/bin/sh

echo "Running database migrations..."
npm run migration:run

echo "Starting NestJS application..."
npm run start:weather-app

