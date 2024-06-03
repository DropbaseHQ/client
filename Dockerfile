FROM nginx:stable-alpine

COPY default.conf.template /etc/nginx/templates/
COPY dist/ /usr/share/nginx/html

EXPOSE 80
