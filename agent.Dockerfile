FROM ghcr.io/lies-exposed/liexp-base:24-latest AS base

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./


# Copy patches (needed for @liexp/* packages with file: dependencies)
COPY patches patches

COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/io packages/@liexp/io
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

# Copy packages (workspace dependencies)
COPY packages packages

# Copy agent service (includes its own patches/)
COPY services/agent services/agent

# Install and build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm packages:build
RUN pnpm agent build
RUN pnpm deploy --filter=agent --prod /prod/agent

FROM base AS dev
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./
COPY patches patches
COPY packages packages
COPY services/agent services/agent

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm packages:build
CMD ["pnpm", "agent", "docker:dev"]

FROM dev AS build

RUN pnpm agent build

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm agent fetch --prod

RUN pnpm agent --prod deploy /prod/agent

FROM ghcr.io/lies-exposed/liexp-base:24-latest AS production
WORKDIR /prod/agent
CMD ["node", "build/run.js"]
