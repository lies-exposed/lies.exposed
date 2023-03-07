FROM ghcr.io/lies-exposed/liexp-base:alpha-latest as build

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
COPY packages/@liexp/ui ./packages/@liexp/ui
COPY services/api ./services/api

RUN yarn install

RUN yarn api build

FROM ghcr.io/lies-exposed/liexp-base:alpha-latest as production

WORKDIR /app

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY .yarn /app/.yarn
COPY services/api/package.json /app/services/api/package.json

# yarn cache
# COPY --from=build /app/.yarn /app/.yarn

# packages
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib
COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json

# API service
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/ormconfig.js /app/services/api/ormconfig.js
COPY --from=build /app/services/api/bin /app/services/api/bin
COPY --from=build /app/services/api/build /app/services/api/build

RUN yarn workspaces focus api --production

RUN rm -rf /app/.yarn/cache /app/node_modules/.cache /app/services/api/node_modules/.cache

# Run everything after as non-privileged user.
USER pptruser

CMD ["yarn", "api", "start"]