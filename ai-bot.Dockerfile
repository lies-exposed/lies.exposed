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


COPY --from=build /usr/src/app/services/ai-bot/build /prod/services/ai-bot/build
COPY --from=build /usr/src/app/services/ai-bot/package.json /prod/services/ai-bot/package.json
COPY --from=build /usr/src/app/services/ai-bot/tsconfig.json /prod/services/ai-bot/tsconfig.json
COPY --from=build /usr/src/app/services/ai-bot/tsconfig.build.json /prod/services/ai-bot/tsconfig.build.json

WORKDIR /prod

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

WORKDIR /prod/services/ai-bot

# Run everything after AS non-privileged user.
USER pptruser

CMD ["pnpm", "start"]