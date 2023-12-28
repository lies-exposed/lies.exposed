FROM ghcr.io/lies-exposed/liexp-base:18-latest as build

WORKDIR /app

COPY .yarn/ .yarn/
RUN --mount=type=cache,target=/app/.yarn/cache

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .
COPY packages/@liexp/core ./packages/@liexp/core
COPY packages/@liexp/test ./packages/@liexp/test
COPY packages/@liexp/shared ./packages/@liexp/shared
COPY packages/@liexp/backend ./packages/@liexp/backend
COPY packages/@liexp/ui ./packages/@liexp/ui
COPY services/api ./services/api

RUN yarn config set --home enableTelemetry false && yarn install && yarn api build


FROM ghcr.io/lies-exposed/liexp-base:18-latest as prod_deps
WORKDIR /app

COPY --from=build /app/.yarn/ /app/.yarn/

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY services/api/package.json /app/services/api/package.json

COPY packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY packages/@liexp/backend/package.json /app/packages/@liexp/backend/package.json
COPY packages/@liexp/test/package.json /app/packages/@liexp/test/package.json

RUN yarn config set --home enableTelemetry false && yarn workspaces focus -A --production

FROM ghcr.io/lies-exposed/liexp-base:18-latest as production

WORKDIR /app

COPY .yarn/plugins /app/.yarn/plugins
COPY .yarn/releases /app/.yarn/releases

COPY tsconfig.json /app/tsconfig.json
COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY services/api/package.json /app/services/api/package.json
COPY services/api/tsconfig.json /app/services/api/tsconfig.json
COPY services/api/tsconfig.build.json /app/services/api/tsconfig.build.json
COPY services/api/ormconfig.js /app/services/api/ormconfig.js

COPY packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY packages/@liexp/backend/package.json /app/packages/@liexp/backend/package.json
COPY packages/@liexp/test/package.json /app/packages/@liexp/test/package.json
COPY packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json

# packages
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib
COPY --from=build /app/packages/@liexp/backend/lib /app/packages/@liexp/backend/lib
COPY --from=build /app/packages/@liexp/test/lib /app/packages/@liexp/test/lib

# API service
COPY --from=build /app/services/api/bin /app/services/api/bin
COPY --from=build /app/services/api/build /app/services/api/build
COPY --from=build /app/services/api/assets /app/services/api/assets

COPY --from=prod_deps /app/node_modules /app/node_modules

RUN yarn workspaces focus -A --production

# Run everything after as non-privileged user.
USER pptruser

CMD ["yarn", "api", "start"]