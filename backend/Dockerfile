FROM node:20-slim

# Install Chromium for Puppeteer
RUN apt-get update && \
    apt-get install -y chromium fonts-liberation libgbm1 --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 4000

CMD ["node", "dist/main"]
