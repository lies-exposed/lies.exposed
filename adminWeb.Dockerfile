FROM node:20-alpine as build

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
COPY services/admin-web ./services/admin-web

RUN yarn

RUN yarn admin-web build

RUN NODE_ENV=production yarn admin-web build:app

FROM node:20-alpine as production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn/plugins/ .yarn/plugins/
COPY .yarn/releases/ .yarn/releases/
COPY .yarnrc.yml .
COPY tsconfig.json .

COPY --from=build /app/services/admin-web/build /app/services/web/build
COPY --from=build /app/services/admin-web/package.json /app/services/web/package.json

RUN yarn workspaces focus --production

WORKDIR /app/services/web

CMD ["yarn", "serve"]