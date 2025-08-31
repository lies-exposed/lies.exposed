# syntax=docker/dockerfile:1

FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest && corepack use pnpm@latest-10

COPY ./package.json /usr/src/app/package.json
COPY ./pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
COPY ./pnpm-workspace.yaml /usr/src/app/pnpm-workspace.yaml
COPY ./patches /usr/src/app/patches
COPY ./tsconfig.json /usr/src/app/tsconfig.json
COPY ./packages /usr/src/app/packages
COPY ./services/admin-web /usr/src/app/services/admin-web

WORKDIR /usr/src/app

CMD ["pnpm", "admin-web", "dev"]

FROM base AS dev

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM base AS build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm admin-web build
RUN pnpm admin-web build:app

FROM build AS pruned

COPY --from=base /usr/src/app ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm admin-web fetch --prod

RUN pnpm admin-web --prod deploy --legacy /prod/admin-web

WORKDIR /prod/admin-web

FROM nginx:1.25.4-alpine AS production

# COPY ./resources/nginx/snippets/ /etc/nginx/snippets/
# RUN mkdir -p /etc/nginx/conf.d/

# create directory for logs
RUN mkdir -p /var/log/nginx/

COPY --from=build /usr/src/app/services/admin-web/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
