# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates wget \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- dependencies (devDependencies included: prisma CLI, tsx, typescript) ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- TypeScript build ----
FROM deps AS build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production PORT=4000 UPLOADS_DIR=/app/uploads
# full node_modules: the container needs the prisma CLI (migrate deploy) and tsx (seed)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json tsconfig.json ./
COPY prisma ./prisma
# the seed reuses a few helpers from src
COPY src ./src
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/uploads && chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
