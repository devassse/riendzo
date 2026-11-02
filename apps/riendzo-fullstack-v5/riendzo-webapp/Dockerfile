# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-bookworm-slim AS build
WORKDIR /app
# NEXT_PUBLIC_* are written into the pages at build time, so they must be defined here
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SOCIAL_FACEBOOK=
ARG NEXT_PUBLIC_SOCIAL_INSTAGRAM=
ARG NEXT_PUBLIC_SOCIAL_YOUTUBE=
ARG NEXT_PUBLIC_SOCIAL_TIKTOK=
ARG NEXT_PUBLIC_SOCIAL_WHATSAPP=
ARG NEXT_PUBLIC_SOCIAL_X=
ARG NEXT_PUBLIC_SOCIAL_LINKEDIN=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SOCIAL_FACEBOOK=$NEXT_PUBLIC_SOCIAL_FACEBOOK \
    NEXT_PUBLIC_SOCIAL_INSTAGRAM=$NEXT_PUBLIC_SOCIAL_INSTAGRAM \
    NEXT_PUBLIC_SOCIAL_YOUTUBE=$NEXT_PUBLIC_SOCIAL_YOUTUBE \
    NEXT_PUBLIC_SOCIAL_TIKTOK=$NEXT_PUBLIC_SOCIAL_TIKTOK \
    NEXT_PUBLIC_SOCIAL_WHATSAPP=$NEXT_PUBLIC_SOCIAL_WHATSAPP \
    NEXT_PUBLIC_SOCIAL_X=$NEXT_PUBLIC_SOCIAL_X \
    NEXT_PUBLIC_SOCIAL_LINKEDIN=$NEXT_PUBLIC_SOCIAL_LINKEDIN \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Content edited in the BackOffice (data/cms) and uploaded files (data/uploads) live here: mount a volume on /app/data
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/pt >/dev/null || exit 1
CMD ["node", "server.js"]
