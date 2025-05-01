FROM node:23 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest && corepack use pnpm@latest-10

FROM base AS dev

WORKDIR /home/node

RUN mkdir build scripts

COPY services/ai-bot/build/run-esbuild.js build/run-esbuild.js

RUN pnpm add pdfjs-dist@^5 @napi-rs/canvas

COPY services/ai-bot/sea-config.json sea-config.json

RUN node --experimental-sea-config sea-config.json

RUN cp $(command -v node) ./ai-bot

RUN strip ./ai-bot

RUN npx postject ai-bot NODE_SEA_BLOB ./build/ai-bot.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

FROM base AS production

WORKDIR /home/node

RUN pnpm add pdfjs-dist@^5 @napi-rs/canvas

COPY --from=dev /home/node/ai-bot ai-bot

CMD ["./ai-bot"]