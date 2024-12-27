FROM ghcr.io/lies-exposed/liexp-base:22-latest AS dev

WORKDIR /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm packages:build

RUN pnpm worker build

FROM ghcr.io/lies-exposed/liexp-base:22-latest AS production

WORKDIR /home/node/worker

COPY --from=dev /usr/src/app/services/worker/build ./build
COPY --from=dev /usr/src/app/services/worker/sea-config.json ./sea-config.json
COPY --from=dev /usr/src/app/services/worker/package.json ./package.json

RUN sed -i "s/\"workspace\:\*/\"0.1.0/g" ./package.json

COPY --from=dev /usr/src/app/packages/@liexp/core/lib ./node_modules/@liexp/core/lib
COPY --from=dev /usr/src/app/packages/@liexp/core/package.json ./node_modules/@liexp/core/package.json

RUN sed -i "s/\"workspace\:\*/\"0.1.0/g" ./node_modules/@liexp/core/package.json

COPY --from=dev /usr/src/app/packages/@liexp/shared/lib ./node_modules/@liexp/shared/lib
COPY --from=dev /usr/src/app/packages/@liexp/shared/package.json ./node_modules/@liexp/shared/package.json

RUN sed -i "s/\"workspace\:\*/\"0.1.0/g" ./node_modules/@liexp/shared/package.json

COPY --from=dev /usr/src/app/packages/@liexp/backend/lib ./node_modules/@liexp/backend/lib
COPY --from=dev /usr/src/app/packages/@liexp/backend/package.json ./node_modules/@liexp/backend/package.json

RUN sed -i "s/\"workspace\:\*/\"0.1.0/g" ./node_modules/@liexp/backend/package.json

RUN npm i --production


# RUN node --experimental-sea-config sea-config.json

# RUN cp $(command -v node) ./build/be-worker

# RUN strip ./build/be-worker

# RUN npx postject ./build/be-worker NODE_SEA_BLOB ./build/be-worker.blob \
#     --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

WORKDIR /home/node/worker

# RUN npm i -g canvas

# CMD ["./be-worker"]