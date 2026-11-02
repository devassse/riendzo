FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
# Aplica as migrations (inclui os dados básicos) e arranca. Conteúdo inicial: docker compose run --rm api npx prisma db seed
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
