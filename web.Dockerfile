FROM node:12-slim as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY packages/@econnessione/io ./packages/@econnessione/io
COPY services/web ./services/web

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /app/packages/@econnessione/io
RUN yarn build

WORKDIR /app/services/web
# RUN yarn build

FROM node:12-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY --from=build /app/packages/@econnessione/io/package.json /app/packages/@econnessione/io/package.json
COPY --from=build /app/packages/@econnessione/io/lib /app/packages/@econnessione/io/lib

COPY --from=build /app/services/web/package.json /app/services/web/package.json
# COPY --from=build /app/services/web/build /app/services/web/build

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /app/services/web

CMD ["yarn", "start"]