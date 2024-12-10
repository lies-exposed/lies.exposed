FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM base AS build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

ENV VITE_NODE_ENV=production

RUN pnpm admin-web build
RUN pnpm admin-web build:app

FROM base AS production

COPY --from=dev /usr/src/app/pnpm-workspace.yaml /prod/pnpm-workspace.yaml
COPY --from=dev /usr/src/app/package.json /prod/package.json
COPY --from=dev /usr/src/app/pnpm-lock.yaml /prod/pnpm-lock.yaml
COPY --from=dev /usr/src/app/.npmrc /prod/.npmrc

COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /usr/src/app/services/admin-web/build /prod/services/admin-web/build
COPY --from=build /usr/src/app/services/admin-web/package.json /prod/services/admin-web/package.json

WORKDIR /prod

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

WORKDIR /prod/services/admin-web

CMD ["pnpm", "serve"]