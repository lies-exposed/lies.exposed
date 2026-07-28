ARG NODE_VERSION=26

FROM ghcr.io/lies-exposed/liexp-base:${NODE_VERSION}-latest AS dev

WORKDIR /home/node

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY patches patches
COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/io packages/@liexp/io
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

COPY services/ai-bot services/ai-bot

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages build

WORKDIR /home/node/services/ai-bot

CMD ["pnpm", "docker:dev"]

FROM ghcr.io/lies-exposed/liexp-base:${NODE_VERSION}-latest AS deps

WORKDIR /home/node

RUN pnpm add pdfjs-dist@^5 \
    @napi-rs/canvas@^0.1.70 \
    @napi-rs/canvas-linux-x64-musl@^0.1.70 \
    puppeteer-core@^24 \
    puppeteer-extra@^3 \
    puppeteer-extra-plugin-stealth@^2


FROM ghcr.io/lies-exposed/liexp-base:${NODE_VERSION}-latest AS production

WORKDIR /home/node

COPY --from=deps /home/node/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs /home/node/build/
COPY --from=deps /home/node/node_modules ./node_modules
COPY ./services/ai-bot/build/run-esbuild.cjs build/run-esbuild.cjs

CMD ["node", "build/run-esbuild.cjs"]
