FROM node:16-slim as build

WORKDIR /app

COPY .yarn/ .yarn/
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY tsconfig.json .

COPY packages/@liexp/core ./packages/@liexp/core
COPY packages/@liexp/shared ./packages/@liexp/shared
COPY packages/@liexp/ui ./packages/@liexp/ui
COPY packages/@liexp/test ./packages/@liexp/test
COPY services/admin-web ./services/admin-web

RUN yarn

RUN NODE_ENV=production yarn admin-web build

FROM node:16-slim as production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .yarn/plugins/ .yarn/plugins/
COPY .yarn/releases/ .yarn/releases/
COPY .yarnrc.yml .
COPY tsconfig.json .

# COPY --from=build /app/packages/@liexp/core/package.json /app/packages/@liexp/core/package.json
# COPY --from=build /app/packages/@liexp/core/lib /app/packages/@liexp/core/lib

# COPY --from=build /app/packages/@liexp/shared/package.json /app/packages/@liexp/shared/package.json
# COPY --from=build /app/packages/@liexp/shared/lib /app/packages/@liexp/shared/lib

# COPY --from=build /app/packages/@liexp/ui/lib /app/packages/@liexp/ui/lib
# COPY --from=build /app/packages/@liexp/ui/package.json /app/packages/@liexp/ui/package.json

COPY --from=build /app/services/admin-web/build /app/services/web/build
COPY --from=build /app/services/admin-web/package.json /app/services/web/package.json

RUN yarn workspaces focus --production

WORKDIR /app/services/web

CMD ["yarn", "serve"]