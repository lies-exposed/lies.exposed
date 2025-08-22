FROM ghcr.io/lies-exposed/liexp-base:24-latest AS dev

WORKDIR /home/node

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .npmrc ./

COPY patches patches
COPY packages/@liexp/core packages/@liexp/core
COPY packages/@liexp/test packages/@liexp/test
COPY packages/@liexp/shared packages/@liexp/shared
COPY packages/@liexp/backend packages/@liexp/backend

COPY services/ai-bot services/ai-bot

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

FROM ghcr.io/lies-exposed/liexp-base:24-latest AS deps

WORKDIR /home/node

RUN pnpm add pdfjs-dist@^5 \
    @napi-rs/canvas@^0.1.70 \
    @napi-rs/canvas-linux-x64-musl@^0.1.70 \
    puppeteer-core@^24 \
    puppeteer-extra@^3 \
    puppeteer-extra-plugin-stealth@^2


FROM ghcr.io/lies-exposed/liexp-base:24-latest AS build

WORKDIR /home/node

RUN mkdir build scripts

COPY ./services/ai-bot/build/run-esbuild.js build/run-esbuild.js

COPY --from=deps /home/node/node_modules ./node_modules

COPY services/ai-bot/sea-config.json sea-config.json

RUN node --experimental-sea-config sea-config.json

RUN cp $(command -v node) ./ai-bot

RUN strip ./ai-bot

RUN npx postject ai-bot NODE_SEA_BLOB ./build/ai-bot.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2



FROM ghcr.io/lies-exposed/liexp-base:24-latest AS production

WORKDIR /home/node

COPY --from=deps /home/node/node_modules ./node_modules

COPY --from=build /home/node/ai-bot ai-bot

CMD ["./ai-bot"]
