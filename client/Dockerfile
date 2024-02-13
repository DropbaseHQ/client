# Build stage
FROM node:18-alpine3.19 AS build-stage

ARG VITE_API_ENDPOINT=https://api.dropbase.io/
ARG VITE_WORKER_API_ENDPOINT=http://localhost:9090
ARG VITE_WORKER_WS_ENDPOINT=ws://localhost:9090
ARG VITE_PYTHON_LSP_SERVER=ws://localhost:9095

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Release
FROM nginx:stable-alpine

COPY default.conf.template /etc/nginx/templates/
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
