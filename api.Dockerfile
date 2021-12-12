FROM node:14-slim as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/api ./services/api

RUN yarn install

RUN yarn build

FROM node:14-slim as deps

WORKDIR /deps
COPY package.json yarn.lock ./

COPY --from=build /app/packages/@econnessione/core/package.json /deps/packages/@econnessione/core/package.json
COPY --from=build /app/packages/@econnessione/shared/package.json /deps/packages/@econnessione/shared/package.json
COPY --from=build /app/services/api/package.json /deps/services/api/package.json

RUN yarn install

FROM buildkite/puppeteer:9.1.1 as production

WORKDIR /app

COPY package.json ./
COPY services/api/package.json /app/services/api/package.json

# packages
COPY --from=build /app/packages/@econnessione/core/lib /app/packages/@econnessione/core/lib
COPY --from=build /app/packages/@econnessione/shared/lib /app/packages/@econnessione/shared/lib

# API service
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/ormconfig.js /app/services/api/ormconfig.js
COPY --from=build /app/services/api/build /app/services/api/build

# COPY --from=deps /deps/packages/@econnessione/core/node_modules /app/packages/@econnessione/core/node_modules
COPY --from=deps /deps/node_modules /app/node_modules
COPY --from=deps /deps/services/api/node_modules /app/services/api/node_modules

CMD ["yarn", "api", "start"]