FROM ghcr.io/lies-exposed/liexp-base:24-pnpm-latest AS dev

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY patches patches
COPY packages/@liexp/eslint-config packages/@liexp/eslint-config
COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/io packages/@liexp/io
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

COPY services/api services/api

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages build

CMD ["pnpm", "api", "dev"]

FROM dev AS build

RUN pnpm api build

RUN pnpm api pkg

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm api fetch --prod

RUN pnpm api --prod deploy --legacy /prod/api

FROM node:24-slim AS production

ARG VERSION
ARG COMMIT_HASH
ENV VERSION=${VERSION}
ENV COMMIT_HASH=${COMMIT_HASH}

WORKDIR /prod/api

COPY --from=build /usr/src/app/services/api/build/api ./api
COPY --from=pruned /prod/api/node_modules ./node_modules

CMD ["./api"]
