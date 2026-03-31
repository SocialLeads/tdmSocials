FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

FROM caddy:2

COPY --from=build /app/build /srv
COPY Caddyfile.static /etc/caddy/Caddyfile

EXPOSE 3000
