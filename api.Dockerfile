FROM ghcr.io/lies-exposed/liexp-base:20-latest AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM ghcr.io/lies-exposed/liexp-base:20-latest AS build

COPY --from=dev /usr/src/app /usr/src/app

WORKDIR /usr/src/app

RUN pnpm api build

FROM ghcr.io/lies-exposed/liexp-base:20-latest AS production

COPY --from=build /usr/src/app/pnpm-lock.yaml /prod/pnpm-lock.yaml
COPY --from=build /usr/src/app/pnpm-workspace.yaml /prod/pnpm-workspace.yaml
COPY --from=build /usr/src/app/package.json /prod/package.json
COPY --from=build /usr/src/app/.npmrc /prod/.npmrc
COPY --from=build /usr/src/app/tsconfig.json /prod/tsconfig.json


COPY --from=build /usr/src/app/packages/@liexp/core/lib /prod/packages/@liexp/core/lib
COPY --from=build /usr/src/app/packages/@liexp/core/package.json /prod/packages/@liexp/core/package.json

COPY --from=build /usr/src/app/packages/@liexp/backend/lib /prod/packages/@liexp/backend/lib
COPY --from=build /usr/src/app/packages/@liexp/backend/package.json /prod/packages/@liexp/backend/package.json

COPY --from=build /usr/src/app/packages/@liexp/shared/lib /prod/packages/@liexp/shared/lib
COPY --from=build /usr/src/app/packages/@liexp/shared/package.json /prod/packages/@liexp/shared/package.json

COPY --from=build /usr/src/app/packages/@liexp/ui/lib /prod/packages/@liexp/ui/lib
COPY --from=build /usr/src/app/packages/@liexp/ui/package.json /prod/packages/@liexp/ui/package.json

COPY --from=build /usr/src/app/services/api/build /prod/services/api/build
COPY --from=build /usr/src/app/services/api/package.json /prod/services/api/package.json
COPY --from=build /usr/src/app/services/api/tsconfig.json /prod/services/api/tsconfig.json
COPY --from=build /usr/src/app/services/api/tsconfig.build.json /prod/services/api/tsconfig.build.json
COPY --from=build /usr/src/app/services/api/ormconfig.js /prod/services/api/ormconfig.js

WORKDIR /prod

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

WORKDIR /prod/services/api

# Run everything after AS non-privileged user.
USER pptruser

CMD ["pnpm", "start"]