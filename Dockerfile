FROM buildkite/puppeteer:9.1.1 as build

WORKDIR /app

COPY packages/@econnessione/core ./packages/@econnessione/core
COPY packages/@econnessione/shared ./packages/@econnessione/shared
COPY services/api ./services/api
COPY services/web ./services/web
COPY services/admin-web ./services/admin-web
COPY services/storybook ./services/storybook
COPY services/data ./services/data

COPY .eslintrc .
COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install --non-interactive