#!/usr/bin/env sh
set -e

cd "$(git rev-parse --show-toplevel)"

docker build -f packages/backend/dev.Dockerfile -t flight-paths-backend:dev .
docker build -f packages/backend/Dockerfile -t flight-paths-backend --build-arg FLIGHT_PATHS_BACKEND_DEV_IMAGE=flight-paths-backend:dev packages/backend/

docker build -f packages/frontend/dev.Dockerfile -t flight-paths-frontend:dev --build-arg FLIGHT_PATHS_BACKEND_DEV_IMAGE=flight-paths-backend:dev .
docker build -f packages/frontend/Dockerfile -t flight-paths-frontend --build-arg FLIGHT_PATHS_FRONTEND_DEV_IMAGE=flight-paths-frontend:dev packages/frontend/

docker build -f docker/proxy/Dockerfile -t flight-paths-proxy docker/proxy/
