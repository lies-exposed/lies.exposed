FROM ghcr.io/lies-exposed/liexp-base:24-latest AS dev

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY patches patches
COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

COPY services/api services/api

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

RUN pnpm api build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm api fetch --prod

RUN pnpm api --prod deploy --legacy /prod/api

FROM node:24-alpine AS production

WORKDIR /prod/api

COPY --from=pruned /prod/api .

CMD ["node", "build/run.js"]
