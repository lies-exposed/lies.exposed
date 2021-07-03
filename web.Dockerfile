FROM node:14-slim as build

WORKDIR /app

COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/web ./services/web
COPY package.json ./package.json
COPY .eslintrc .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install --non-interactive
RUN yarn build

FROM node:14-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY --from=build /app/packages/@econnessione/core/package.json /app/packages/@econnessione/core/package.json
COPY --from=build /app/packages/@econnessione/shared/lib /app/packages/@econnessione/shared/lib

COPY --from=build /app/services/web/package.json /app/services/web/package.json
COPY --from=build /app/services/web/build /app/services/web/build

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /app/services/web

CMD ["yarn", "start"]