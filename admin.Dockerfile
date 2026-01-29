# syntax=docker/dockerfile:1

FROM ghcr.io/lies-exposed/liexp-base:24-pnpm-latest AS base

COPY ./package.json /usr/src/app/package.json
COPY ./pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
COPY ./pnpm-workspace.yaml /usr/src/app/pnpm-workspace.yaml
COPY ./patches /usr/src/app/patches
COPY ./tsconfig.json /usr/src/app/tsconfig.json
COPY ./packages /usr/src/app/packages
COPY ./services/admin /usr/src/app/services/admin

WORKDIR /usr/src/app

FROM base AS dev

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages build

CMD ["pnpm", "admin", "docker:dev"]

FROM dev AS build

ARG DOTENV_CONFIG_PATH=".env"

RUN pnpm admin build

ENV DOTENV_CONFIG_PATH=$DOTENV_CONFIG_PATH

RUN pnpm admin build:app-server

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm admin fetch --prod

RUN pnpm admin --prod deploy --legacy /prod/admin

WORKDIR /prod/admin

FROM node:24-alpine AS production

WORKDIR /prod/admin

COPY --from=pruned /prod/admin ./

CMD ["node", "./build/server/server.js"]
