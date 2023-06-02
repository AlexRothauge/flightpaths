FROM node:18-alpine

WORKDIR /var/flight-paths/

COPY packages/backend/src/ /var/flight-paths/src/
COPY \
    packages/backend/.eslintrc.cjs \
    packages/backend/.nycrc.json \
    packages/backend/package.json \
    packages/backend/tsconfig.json \
    packages/backend/tsoa.json \
    yarn.lock \
    /var/flight-paths/

RUN apk add python3 pixman pixman-dev cairo cairo-dev pango pango-dev libjpeg-turbo libjpeg-turbo-dev giflib giflib-dev librsvg librsvg-dev build-base \
    && yarn install --immutable --immutable-cache --check-cache --frozen-install \
    && apk del python3 pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev librsvg-dev build-base \
    && yarn generate:api
