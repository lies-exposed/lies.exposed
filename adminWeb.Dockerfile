FROM node:20-slim as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base as dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM base as build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm admin-web build
RUN pnpm admin-web build:app

FROM base as production

COPY --from=dev /usr/src/app/pnpm-workspace.yaml /prod/pnpm-workspace.yaml
COPY --from=dev /usr/src/app/package.json /prod/package.json

COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /usr/src/app/services/admin-web/build /prod/services/admin-web/build
COPY --from=build /usr/src/app/services/admin-web/package.json /prod/services/admin-web/package.json

WORKDIR /prod

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts

WORKDIR /prod/services/admin-web

CMD ["pnpm", "serve"]