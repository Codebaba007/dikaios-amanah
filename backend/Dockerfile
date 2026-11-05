# Dikaios Amanah API — production image
FROM node:22-bookworm-slim

WORKDIR /app

# OpenSSL is required by the Prisma query engine.
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY scripts ./scripts

# Uploaded files live here; mount a volume (or use STORAGE_DRIVER=s3) to persist them.
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/server.js"]
