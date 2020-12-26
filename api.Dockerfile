FROM node:12-slim as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY packages/@econnessione/io ./packages/@econnessione/io
COPY services/api ./services/api

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /app/packages/@econnessione/io
RUN yarn build

WORKDIR /app/services/api
RUN yarn build

FROM node:12-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY --from=build /app/packages/@econnessione/io/package.json /app/packages/@econnessione/io/package.json
COPY --from=build /app/packages/@econnessione/io/lib /app/packages/@econnessione/io/lib

COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/build /app/services/api/build

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /app/services/api

CMD ["yarn", "start"]