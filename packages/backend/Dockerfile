ARG FLIGHT_PATHS_BACKEND_DEV_IMAGE

FROM $FLIGHT_PATHS_BACKEND_DEV_IMAGE as builder

RUN yarn build

FROM node:18-alpine

COPY --from=builder /var/flight-paths/dist/ /var/flight-paths/dist/
COPY --from=builder \
    /var/flight-paths/package.json \
    /var/flight-paths/yarn.lock \
    /var/flight-paths/

WORKDIR /var/flight-paths/

RUN apk add python3 pixman pixman-dev cairo cairo-dev pango pango-dev libjpeg-turbo libjpeg-turbo-dev giflib giflib-dev librsvg librsvg-dev build-base \
    && yarn install --immutable --immutable-cache --check-cache --frozen-install --production \
    && apk del python3 pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev librsvg-dev build-base \
    && echo "#!/usr/bin/env sh" >/usr/local/bin/flight-paths \
    && echo "cd /var/flight-paths/" >>/usr/local/bin/flight-paths \
    && echo 'exec node /var/flight-paths/dist "$@"' >>/usr/local/bin/flight-paths \
    && chmod 0755 /usr/local/bin/flight-paths

EXPOSE 8080

CMD ["flight-paths", "start-server"]
