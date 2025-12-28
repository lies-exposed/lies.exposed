# syntax=docker/dockerfile:1

FROM ghcr.io/lies-exposed/liexp-base:24-pnpm-latest AS base

COPY ./package.json /usr/src/app/package.json
COPY ./pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
COPY ./pnpm-workspace.yaml /usr/src/app/pnpm-workspace.yaml
COPY ./patches /usr/src/app/patches
COPY ./tsconfig.json /usr/src/app/tsconfig.json
COPY ./packages /usr/src/app/packages
COPY ./services/admin-web /usr/src/app/services/admin-web

WORKDIR /usr/src/app

FROM base AS dev

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

CMD ["pnpm", "admin-web", "docker:dev"]

FROM dev AS build

ARG DOTENV_CONFIG_PATH=".env"

RUN pnpm admin-web build

ENV DOTENV_CONFIG_PATH=$DOTENV_CONFIG_PATH

RUN pnpm admin-web build:app-server

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm admin-web fetch --prod

RUN pnpm admin-web --prod deploy --legacy /prod/admin-web

WORKDIR /prod/admin-web

FROM node:24-alpine AS production

WORKDIR /prod/admin-web

COPY --from=pruned /prod/admin-web ./

CMD ["node", "./build/server/server.js"]