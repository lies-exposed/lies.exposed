# syntax=docker/dockerfile:1

FROM ghcr.io/lies-exposed/liexp-base:24-pnpm-latest AS dev

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY ./patches ./patches
COPY ./packages/@liexp/eslint-config ./packages/@liexp/eslint-config
COPY ./packages/@liexp/core ./packages/@liexp/core
COPY ./packages/@liexp/io ./packages/@liexp/io
COPY ./packages/@liexp/test ./packages/@liexp/test
COPY ./packages/@liexp/shared ./packages/@liexp/shared
COPY ./packages/@liexp/backend ./packages/@liexp/backend
COPY ./packages/@liexp/ui ./packages/@liexp/ui

COPY ./services/web ./services/web

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

CMD ["pnpm", "docker:dev"]

FROM dev AS build

ARG DOTENV_CONFIG_PATH=".env"

ENV VITE_NODE_ENV=production

RUN pnpm web build

ENV DOTENV_CONFIG_PATH=${DOTENV_CONFIG_PATH}

RUN pnpm web build:app-server

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm web fetch --prod

RUN pnpm web --prod deploy --legacy /prod/web

WORKDIR /prod/web

FROM node:24-alpine AS production

WORKDIR /prod/web

COPY --from=pruned /prod/web ./

CMD ["node", "./build/server/server.js"]