FROM ghcr.io/lies-exposed/liexp-base:23-latest AS dev

WORKDIR /usr/src/app

COPY . ./
# COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

# COPY packages/@liexp/core packages/@liexp/core
# COPY packages/@liexp/test packages/@liexp/test
# COPY packages/@liexp/shared packages/@liexp/shared
# COPY packages/@liexp/backend packages/@liexp/backend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

RUN pnpm worker build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm worker fetch --prod

RUN pnpm worker --prod deploy --legacy /prod/worker

FROM ghcr.io/lies-exposed/liexp-base:23-latest AS production

WORKDIR /prod/worker

COPY --from=pruned /prod/worker .

CMD ["node", "build/run.js"]
