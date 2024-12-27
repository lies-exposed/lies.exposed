FROM ghcr.io/lies-exposed/liexp-base:22-latest AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

RUN pnpm api build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm api fetch --prod

RUN pnpm api --prod deploy /prod/api

FROM node:22-alpine AS production

WORKDIR /prod/api

COPY --from=pruned /prod/api .

CMD ["node", "build/run.js"]