FROM ghcr.io/lies-exposed/liexp-base:22-latest AS dev

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc /usr/src/app/

COPY packages/@liexp/core /usr/src/app/packages/@liexp/core
COPY packages/@liexp/test /usr/src/app/packages/@liexp/test
COPY packages/@liexp/shared /usr/src/app/packages/@liexp/shared
COPY packages/@liexp/backend /usr/src/app/packages/@liexp/backend

COPY services/api /usr/src/app/services/api

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

RUN pnpm api build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm api fetch --prod

RUN pnpm api --prod deploy --legacy /prod/api

FROM node:22-alpine AS production

WORKDIR /prod/api

COPY --from=pruned /prod/api .

CMD ["node", "build/run.js"]