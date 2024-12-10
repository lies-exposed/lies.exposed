FROM ghcr.io/lies-exposed/liexp-base:22-latest AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

ENV VITE_NODE_ENV=production

RUN pnpm web build
RUN pnpm web build:app-server

FROM build AS pruned

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm web fetch --prod

RUN pnpm web --prod deploy /prod/web

WORKDIR /prod

FROM ghcr.io/lies-exposed/liexp-base:20-pnpm-latest AS production

WORKDIR /prod/web

COPY --from=pruned /prod/web ./

CMD ["node", "./build/server/server.js"]