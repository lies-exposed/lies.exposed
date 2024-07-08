FROM ghcr.io/lies-exposed/liexp-base:20-latest AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM ghcr.io/lies-exposed/liexp-base:20-latest AS build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm web build
RUN pnpm web build:app-server


FROM ghcr.io/lies-exposed/liexp-base:20-pnpm-latest AS production

COPY --from=build /usr/src/app/pnpm-lock.yaml /prod/pnpm-lock.yaml
COPY --from=build /usr/src/app/pnpm-workspace.yaml /prod/pnpm-workspace.yaml
COPY --from=build /usr/src/app/package.json /prod/package.json
COPY --from=build /usr/src/app/.npmrc /prod/.npmrc

COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/assets /prod/packages/@liexp/ui/assets
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /usr/src/app/services/web/build /prod/services/web/build
COPY --from=build /usr/src/app/services/web/package.json /prod/services/web/package.json

WORKDIR /prod

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

WORKDIR /prod/services/web

CMD ["pnpm", "serve"]