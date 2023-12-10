FROM node:18-slim as build

WORKDIR /app

COPY .yarn  ./.yarn
COPY packages/@liexp/core ./packages/@liexp/core
COPY packages/@liexp/test ./packages/@liexp/test
COPY packages/@liexp/shared ./packages/@liexp/shared
COPY packages/@liexp/ui ./packages/@liexp/ui

COPY services/api ./services/api
COPY services/web ./services/web
COPY services/admin-web ./services/admin-web

COPY .eslintrc.js .
COPY package.json .
COPY .yarnrc.yml .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install

RUN yarn build