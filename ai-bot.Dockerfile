FROM node:22 AS dev

WORKDIR /home/node

RUN mkdir build scripts

COPY services/ai-bot/build/run-esbuild.js build/run-esbuild.js
COPY services/ai-bot/sea-config.json sea-config.json

RUN node --experimental-sea-config sea-config.json

RUN cp $(command -v node) ./ai-bot

RUN strip ./ai-bot

RUN npx postject ai-bot NODE_SEA_BLOB ./build/ai-bot.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

FROM node:22-slim AS production

WORKDIR /home/node

COPY --from=dev /home/node/ai-bot ai-bot

CMD ["./ai-bot"]