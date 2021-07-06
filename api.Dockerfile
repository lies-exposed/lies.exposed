FROM node:14-slim as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/api ./services/api

RUN yarn install --pure-lockfile --non-interactive

RUN yarn build

FROM node:14-slim

WORKDIR /app

COPY package.json yarn.lock ./


COPY --from=build /app/packages/@econnessione/core/package.json /app/packages/@econnessione/core/package.json
COPY --from=build /app/packages/@econnessione/core/lib /app/packages/@econnessione/core/lib

COPY --from=build /app/packages/@econnessione/shared/package.json /app/packages/@econnessione/shared/package.json
COPY --from=build /app/packages/@econnessione/shared/lib /app/packages/@econnessione/shared/lib

COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/ormconfig.js /app/serivces/api/ormconfig.js
COPY --from=build /app/services/api/build /app/services/api/build

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /app/services/api

CMD ["yarn", "start"]