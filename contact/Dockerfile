# syntax=docker/dockerfile:1
# The contact form backend (contact/server.mjs). Built by Dokploy from
# ../docker-compose.prod.yml with the repo root as context, so it can take
# the package list from src/pricing — the same file the pages render from.
FROM node:22-alpine
WORKDIR /app
COPY src/pricing/packages.mjs src/pricing/packages.mjs
COPY contact/server.mjs contact/server.mjs
# packages.mjs is an ES module; the root package.json is what says so.
RUN echo '{"type":"module"}' > package.json
USER node
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "contact/server.mjs"]
