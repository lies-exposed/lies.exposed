FROM node:24-alpine AS base


FROM base AS pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest && corepack use pnpm@latest-10

WORKDIR /usr/src/app

FROM pnpm AS api-base

RUN apk add --no-cache \
    libc6-compat \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    cairo \
    jpeg \
    pango \
    giflib \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ffmpeg \
    curl

RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /prod \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /prod

# Run everything after AS non-privileged user.
# USER pptruser

WORKDIR /usr/src/app
