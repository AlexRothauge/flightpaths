ARG FLIGHT_PATHS_BACKEND_DEV_IMAGE

FROM $FLIGHT_PATHS_BACKEND_DEV_IMAGE as builder

FROM node:18-alpine

COPY --from=builder /var/flight-paths/src/api/routes/openapi/swagger.json /var/flight-paths/
COPY packages/frontend/public/ /var/flight-paths/public/
COPY packages/frontend/src/ /var/flight-paths/src/
COPY packages/frontend/cypress/ /var/flight-paths/cypress/
COPY \
  packages/frontend/index.html \
  packages/frontend/cypress.config.ts \
  packages/frontend/env.d.ts \
  packages/frontend/package.json \
  packages/frontend/tsconfig.json \
  packages/frontend/tsconfig.app.json \
  packages/frontend/tsconfig.config.json \
  packages/frontend/tsconfig.vitest.json \
  yarn.lock \
  packages/frontend/vite.config.ts \
  /var/flight-paths/

WORKDIR /var/flight-paths/

RUN yarn install --immutable --immutable-cache --check-cache --frozen-install
