FROM node:20-alpine as dev

WORKDIR /app

COPY .yarn/ .yarn/
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .

COPY packages/@liexp ./packages/@liexp
COPY services/web ./services/web

RUN yarn config set --home enableTelemetry false

RUN yarn

FROM node:20-alpine as build

ARG NODE_ENV=production
ARG DOTENV_CONFIG_PATH=.env

WORKDIR /app

COPY --from=dev /app ./

RUN export NODE_ENV=${NODE_ENV}
RUN export DOTENV_CONFIG_PATH=${DOTENV_CONFIG_PATH}

RUN yarn web build && yarn web build:app-server

FROM ghcr.io/lies-exposed/liexp-base:20-latest as prod_deps
WORKDIR /app

COPY --from=build /app/.yarn/ /app/.yarn/

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY services/web/package.json /app/services/web/package.json

COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY --from=build /app/packages/@liexp/test/package.json /app/packages/@liexp/test/package.json
COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
# COPY --from=build /app/packages/@liexp/react-page/package.json /app/packages/@liexp/react-page/package.json
COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json

RUN yarn config set --home enableTelemetry false && yarn workspaces focus -A --production

FROM node:20-alpine as production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn/plugins/ .yarn/plugins/
COPY .yarn/releases/ .yarn/releases/
COPY .yarnrc.yml .

COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/test/package.json /app/packages/@liexp/test/package.json
COPY --from=build /app/packages/@liexp/test/lib /app/packages/@liexp/test/lib
COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib
# COPY --from=build /app/packages/@liexp/react-page/package.json /app/packages/@liexp/react-page/package.json
# COPY --from=build /app/packages/@liexp/react-page/lib /app/packages/@liexp/react-page/lib
# COPY --from=build /app/packages/@liexp/react-page/assets /app/packages/@liexp/react-page/assets
COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json
COPY --from=build /app/packages/@liexp/ui/lib /app/packages/@liexp/ui/lib



COPY --from=build /app/services/web/build /app/services/web/build
COPY --from=build /app/services/web/package.json /app/services/web/package.json
COPY --from=build /app/services/web/.env /app/services/web/.env

COPY --from=prod_deps /app/.yarn/ /app/.yarn/
COPY --from=prod_deps /app/node_modules /app/node_modules

RUN yarn config set --home enableTelemetry false

WORKDIR /app/services/web

CMD ["yarn", "serve"]