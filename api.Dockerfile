FROM ghcr.io/lies-exposed/liexp-base:20-latest as dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM ghcr.io/lies-exposed/liexp-base:20-latest as build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm api build

RUN pnpm deploy --filter=api --prod /prod/services/api

FROM ghcr.io/lies-exposed/liexp-base:20-latest as production

COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/backend/lib /prod/packages/@liexp/backend/lib
COPY --from=build /usr/src/app/packages/@liexp/backend/package.json /prod/packages/@liexp/backend/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /prod/services/api /prod/services/api

WORKDIR /prod/services/api

# Run everything after as non-privileged user.
USER pptruser

CMD ["pnpm", "start"]