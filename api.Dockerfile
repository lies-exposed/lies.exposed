FROM node:16-alpine as build

WORKDIR /app

# see https://github.com/Automattic/node-canvas/issues/866
RUN apk add --no-cache --virtual .build-deps \
    build-base \
	g++ \
	cairo-dev \
	jpeg-dev \
	pango-dev \
	giflib-dev \
    && apk add --no-cache --virtual .runtime-deps \
    cairo \
	jpeg \
	pango \
	giflib

COPY .yarn/ .yarn/
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

FROM node:16-slim as production

WORKDIR /app

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY .yarn /app/.yarn
COPY services/api/package.json /app/services/api/package.json

# yarn cache
COPY --from=build /app/.yarn /app/.yarn

# packages
COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib
COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib

# API service
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/ormconfig.js /app/services/api/ormconfig.js
COPY --from=build /app/services/api/build /app/services/api/build

RUN yarn workspaces focus --production

CMD ["yarn", "api", "start"]