FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# Local development: docker-compose.yaml mounts the project over this copy.
FROM deps AS dev
ENV NODE_ENV=development
# nest start --watch calls ps to stop the old process; the slim image lacks it.
USER root
RUN apt-get update && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*
USER node
COPY --chown=node:node . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM deps AS build
COPY --chown=node:node . .
RUN npm run build && npm prune --omit=dev

FROM base AS prod
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/src/main"]
