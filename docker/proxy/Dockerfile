FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/
COPY proxy.nginx /etc/nginx/conf.d/default.conf

EXPOSE 8080

USER nginx:nginx
