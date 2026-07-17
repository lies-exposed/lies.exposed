ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-bookworm-slim AS base


FROM base AS pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# install curl for healthcheck
RUN apt-get update && apt-get install -y curl

RUN npm i -g corepack@latest && corepack use pnpm@latest-10

WORKDIR /usr/src/app

FROM pnpm AS api-base

RUN apt-get update && apt-get install -y \
    libc-dev \
    build-essential \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libcairo-2 \
    libpango-1.0-0 \
    libgif7 \
    chromium \
    fonts-freefont-ttf \
    ffmpeg \
    nss \
    libfreetype6 \
    libfreetype-dev \
    libharfbuzz-dev \
    ca-certificates

RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /prod \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /prod

# Run everything after AS non-privileged user.
# USER pptruser

WORKDIR /usr/src/app
