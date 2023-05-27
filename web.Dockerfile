FROM node:16-alpine as build

ARG NODE_ENV=production
ARG DOTENV_CONFIG_PATH=.env

WORKDIR /app

COPY .yarn/ .yarn/
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .

COPY packages/@liexp/core ./packages/@liexp/core
COPY packages/@liexp/test ./packages/@liexp/test
COPY packages/@liexp/shared ./packages/@liexp/shared
COPY packages/@liexp/ui ./packages/@liexp/ui
COPY services/web ./services/web

RUN yarn config set --home enableTelemetry false

RUN export NODE_ENV=${NODE_ENV}
RUN export DOTENV_CONFIG_PATH=${DOTENV_CONFIG_PATH}

RUN yarn && yarn web build && yarn web build:app-server

FROM node:16-slim as production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn/plugins/ .yarn/plugins/
COPY .yarn/releases/ .yarn/releases/
COPY .yarnrc.yml .
# COPY tsconfig.json .

COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib
COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json
COPY --from=build /app/packages/@liexp/ui/lib /app/packages/@liexp/ui/lib

COPY --from=build /app/services/web/build /app/services/web/build
COPY --from=build /app/services/web/package.json /app/services/web/package.json
COPY --from=build /app/services/web/.env /app/services/web/.env

RUN rm -rf /app/services/web/node_modules && \
    rm -rf /app/node_modules && \
    yarn config set --home enableTelemetry false && \
    yarn workspaces focus web --production && \
    rm -rf /app/.yarn/cache /app/node_modules/.cache /app/services/api/node_modules/.cache

WORKDIR /app/services/web

CMD ["yarn", "serve"]