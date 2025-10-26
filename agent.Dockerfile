FROM ghcr.io/lies-exposed/liexp-base:24-latest AS dev

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY patches patches
COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

COPY services/agent services/agent

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

CMD ["pnpm", "agent", "docker:dev"]

FROM dev AS build

RUN pnpm agent build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm agent fetch --prod

RUN pnpm agent --prod deploy --legacy /prod/agent

FROM ghcr.io/lies-exposed/liexp-base:24-latest AS production

WORKDIR /prod/agent

COPY --from=pruned /prod/agent .

CMD ["node", "build/run.js"]