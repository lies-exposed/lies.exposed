FROM ghcr.io/lies-exposed/liexp-base:20-latest AS dev

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM dev AS build

RUN pnpm ai-bot build

FROM build AS pruned

RUN pnpm ai-bot --prod deploy /prod/ai-bot

FROM ghcr.io/lies-exposed/liexp-base:20-latest AS production

WORKDIR /prod/ai-bot

COPY --from=pruned /prod/ai-bot .

# Run everything after AS non-privileged user.
USER pptruser

CMD ["node", "build/run.js"]