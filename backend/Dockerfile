FROM node:20-slim AS base

# Chromium layer — only rebuilds if this block changes
RUN apt-get update && \
    apt-get install -y chromium fonts-liberation libgbm1 --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Dependencies layer — only rebuilds when package.json changes
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build layer — rebuilds when source changes
FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --production

# Final image — lean
FROM base AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts ./scripts

EXPOSE 4000
CMD ["node", "dist/main"]
