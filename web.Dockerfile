FROM node:16-slim as build

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

RUN yarn

RUN NODE_ENV=production yarn web build

FROM node:16-slim as production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn/plugins/ .yarn/plugins/
COPY .yarn/releases/ .yarn/releases/
COPY .yarnrc.yml .
COPY tsconfig.json .

COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json
COPY --from=build /app/packages/@liexp/test/package.json /app/packages/@liexp/test/package.json

COPY --from=build /app/services/web/build /app/services/web/build
COPY --from=build /app/services/web/package.json /app/services/web/package.json

RUN yarn workspaces focus --production

WORKDIR /app/services/web

CMD ["yarn", "serve"]