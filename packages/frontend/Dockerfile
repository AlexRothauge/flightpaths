ARG FLIGHT_PATHS_FRONTEND_DEV_IMAGE

FROM $FLIGHT_PATHS_FRONTEND_DEV_IMAGE as builder

RUN yarn generate:api:docker \
    && yarn build

FROM nginx:stable-alpine

COPY --from=builder /var/flight-paths/dist/ /var/www/flight-paths/
COPY nginx.conf /etc/nginx/
COPY flight-paths.nginx /etc/nginx/conf.d/default.conf

EXPOSE 8080

USER nginx:nginx
