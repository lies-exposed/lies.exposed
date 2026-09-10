ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-bookworm-slim AS base


ARG PNPM_VERSION=11

FROM base AS pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# non-interactive builds: let `pnpm fetch --prod` purge node_modules without a TTY prompt
ENV CI="true"

# install curl for healthcheck
RUN apt-get update && apt-get install -y curl

RUN npm i -g "pnpm@latest-${PNPM_VERSION}"

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
    libpango-1.0-0 \
    libgif7 \
    chromium \
    fonts-freefont-ttf \
    ffmpeg \
    libnss3 \
    libfreetype6 \
    libfreetype-dev \
    libharfbuzz-dev \
    ca-certificates

RUN addgroup --system pptruser && adduser --system --ingroup pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /prod \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /prod

# Run everything after AS non-privileged user.
# USER pptruser

WORKDIR /usr/src/app
