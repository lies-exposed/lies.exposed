FROM node:20-alpine

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
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app


# Run everything after as non-privileged user.
# USER pptruser

WORKDIR /app
