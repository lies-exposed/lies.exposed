FROM ghcr.io/lies-exposed/liexp-base:24-latest AS dev

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

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm api fetch --prod

RUN pnpm api --prod deploy --legacy /prod/api

FROM node:24-alpine AS production

ARG VERSION
ARG COMMIT_HASH
ENV VERSION=${VERSION}
ENV COMMIT_HASH=${COMMIT_HASH}

WORKDIR /prod/api

COPY --from=pruned /prod/api .

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO/dev/null http://localhost:${SERVER_PORT:-4010}/v1/healthcheck || exit 1

CMD ["node", "build/run.js"]
