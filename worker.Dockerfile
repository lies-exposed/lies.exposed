FROM ghcr.io/lies-exposed/liexp-base:22-latest AS dev

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

RUN pnpm worker build

FROM dev AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm worker fetch --prod

RUN pnpm worker --prod deploy /prod/worker

FROM ghcr.io/lies-exposed/liexp-base:22-latest AS production

WORKDIR /prod/worker

COPY --from=pruned /prod/worker .

CMD ["node", "build/run.js"]
