FROM node:14.18.1 AS builder

WORKDIR /usr/src/app

RUN npm i -g pnpm && pnpm install glob rimraf

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=$GITHUB_TOKEN

COPY .npmrc .
COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:14.18.1-alpine3.14

# Installs latest Chromium package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      bash

RUN npm i -g pnpm

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY tsconfig.json .
COPY package.json .
COPY . .

CMD ["node", "dist/main"]