FROM ghcr.io/lies-exposed/liexp-base:20-latest as dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM ghcr.io/lies-exposed/liexp-base:20-pnpm-latest as build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm web build
RUN pnpm web build:app-server

RUN pnpm deploy --filter=web --prod /prod/services/web

FROM ghcr.io/lies-exposed/liexp-base:20-pnpm-latest as production

COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /prod/services/web /prod/services/web

WORKDIR /prod/services/web

CMD ["pnpm", "serve"]