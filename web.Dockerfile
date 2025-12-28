# syntax=docker/dockerfile:1

FROM ghcr.io/lies-exposed/liexp-base:24-pnpm-latest AS dev

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc /usr/src/app/

COPY ./patches /usr/src/app/patches
COPY ./packages/@liexp/core /usr/src/app/packages/@liexp/core
COPY ./packages/@liexp/test /usr/src/app/packages/@liexp/test
COPY ./packages/@liexp/shared /usr/src/app/packages/@liexp/shared
COPY ./packages/@liexp/ui /usr/src/app/packages/@liexp/ui
COPY ./services/web /usr/src/app/services/web

WORKDIR /usr/src/app

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