FROM node:12-slim as build

WORKDIR /app

COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/api ./services/api
COPY services/web ./services/web
COPY services/admin-web ./services/admin-web
COPY package.json ./package.json
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install --non-interactive --network-timeout 1000000

WORKDIR /app/packages/@econnessione/core
RUN yarn build

WORKDIR /app/packages/@econnessione/shared
RUN yarn build

WORKDIR /app/services/api
RUN yarn build

WORKDIR /app/services/admin-web
RUN DISABLE_ESLINT_PLUGIN=true yarn build

WORKDIR /app/services/web
RUN DISABLE_ESLINT_PLUGIN=true yarn build

FROM node:12-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .

# COPY @econnessione/core package
COPY --from=build /app/packages/@econnessione/core/package.json /app/packages/@econnessione/core/package.json
COPY --from=build /app/packages/@econnessione/core/lib /app/packages/@econnessione/core/lib

# COPY @econnessione/shared package
COPY --from=build /app/packages/@econnessione/shared/package.json /app/packages/@econnessione/shared/package.json
COPY --from=build /app/packages/@econnessione/shared/lib /app/packages/@econnessione/shared/lib

# COPY api service
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/services/api/build /app/services/api/build
COPY --from=build /app/services/api/data /app/services/api/data

COPY --from=build /app/services/web/package.json /app/services/web/package.json
COPY --from=build /app/services/web/build /app/services/web/build

COPY --from=build /app/services/admin-web/package.json /app/services/admin-web/package.json
COPY --from=build /app/services/admin-web/build /app/services/admin-web/build

# COPY node_modules FROM `build` stage
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/api/node_modules /app/services/api/node_modules

# RUN yarn install --pure-lockfile --non-interactive --production

CMD ["yarn", "workspace", "api", "start"]
