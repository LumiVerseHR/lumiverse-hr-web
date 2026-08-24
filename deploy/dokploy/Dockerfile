# syntax=docker/dockerfile:1
# Build the Astro static site, then serve dist/ with nginx.
# Built by Dokploy from ../../docker-compose.prod.yml (context = repo root).

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build   # tools/migrate-to-astro.mjs + astro build -> dist/

# ---- serve ----
FROM nginx:1.27-alpine
COPY deploy/dokploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
