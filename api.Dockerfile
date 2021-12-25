FROM node:14-slim as build

WORKDIR /app

COPY .yarn/ .yarn/
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .
COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/api ./services/api

RUN yarn install

RUN yarn build

FROM node:14-slim as deps

WORKDIR /deps
COPY package.json .yarnrc.yml yarn.lock ./

COPY --from=build /app/.yarn /deps/.yarn
COPY --from=build /app/packages/@econnessione/core/package.json /deps/packages/@econnessione/core/package.json
COPY --from=build /app/packages/@econnessione/shared/package.json /deps/packages/@econnessione/shared/package.json
COPY --from=build /app/services/api/package.json /deps/services/api/package.json

RUN yarn install

FROM node:14-slim as production

WORKDIR /app

COPY package.json /app/package.json
COPY .yarnrc.yml /app/.yarnrc.yml
COPY .yarn /app/.yarn
COPY services/api/package.json /app/services/api/package.json

# yarn cache
COPY --from=build /app/.yarn /app/.yarn

# packages
COPY --from=build /app/packages/@econnessione/core/lib /app/packages/@econnessione/core/lib
COPY --from=build /app/packages/@econnessione/shared/lib /app/packages/@econnessione/shared/lib

# API service
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/ormconfig.js /app/services/api/ormconfig.js
COPY --from=build /app/services/api/build /app/services/api/build

# COPY --from=deps /deps/node_modules /app/node_modules

RUN yarn install

CMD ["yarn", "api", "start"]