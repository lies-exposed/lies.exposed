FROM node:14-slim as build

WORKDIR /app

COPY .yarn  ./.yarn
COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY packages/@econnessione/ui ./packages/@econnessione/ui

COPY services/api ./services/api
COPY services/web ./services/web
COPY services/admin-web ./services/admin-web

COPY .eslintrc .
COPY package.json .
COPY .yarnrc.yml .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install

RUN yarn build