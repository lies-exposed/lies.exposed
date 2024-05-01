FROM ghcr.io/lies-exposed/liexp-base:20-latest as dev

WORKDIR /app

COPY .yarn/ .yarn/
RUN --mount=type=cache,target=/app/.yarn/cache

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .
COPY packages/@liexp ./packages/@liexp
COPY services/api ./services/api

RUN yarn config set --home enableTelemetry false && yarn install

FROM ghcr.io/lies-exposed/liexp-base:20-latest as build

WORKDIR /app

COPY --from=dev /app /app

RUN yarn api build


FROM ghcr.io/lies-exposed/liexp-base:20-latest as prod_deps
WORKDIR /app

COPY --from=build /app/.yarn/ /app/.yarn/

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml

COPY packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY packages/@liexp/backend/package.json /app/packages/@liexp/backend/package.json
COPY packages/@liexp/test/package.json /app/packages/@liexp/test/package.json
COPY packages/@liexp/react-page/package.json /app/packages/@liexp/react-page/package.json

COPY services/api/package.json /app/services/api/package.json

RUN yarn config set --home enableTelemetry false && yarn workspaces focus --production api

FROM ghcr.io/lies-exposed/liexp-base:20-latest as production

WORKDIR /app

COPY .yarn/plugins /app/.yarn/plugins
COPY .yarn/releases /app/.yarn/releases
COPY .yarnrc.yml /app/.yarnrc.yml
COPY yarn.lock /app/yarn.lock

COPY tsconfig.json /app/tsconfig.json
COPY package.json /app/package.json

COPY services/api/package.json /app/services/api/package.json
COPY services/api/tsconfig.json /app/services/api/tsconfig.json
COPY services/api/tsconfig.build.json /app/services/api/tsconfig.build.json
COPY services/api/ormconfig.js /app/services/api/ormconfig.js

COPY packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY packages/@liexp/backend/package.json /app/packages/@liexp/backend/package.json
COPY packages/@liexp/test/package.json /app/packages/@liexp/test/package.json
COPY packages/@liexp/react-page/package.json /app/packages/@liexp/react-page/package.json

# packages
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib
COPY --from=build /app/packages/@liexp/backend/lib /app/packages/@liexp/backend/lib
COPY --from=build /app/packages/@liexp/test/lib /app/packages/@liexp/test/lib
COPY --from=build /app/packages/@liexp/react-page/lib /app/packages/@liexp/react-page/lib

# API service
COPY --from=build /app/services/api/bin /app/services/api/bin
COPY --from=build /app/services/api/build /app/services/api/build
COPY --from=build /app/services/api/assets /app/services/api/assets

COPY --from=prod_deps /app/node_modules /app/node_modules

RUN yarn config set --home enableTelemetry false

# TODO: try to avoid this step
RUN yarn workspaces focus --production api

# Run everything after as non-privileged user.
USER pptruser

CMD ["yarn", "api", "start"]