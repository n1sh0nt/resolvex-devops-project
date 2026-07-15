# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# --- Dependencies layer (cached separately for faster rebuilds) ---
FROM base AS deps
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# --- Final runtime image ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads/complaints uploads/resolutions uploads/avatars && \
    addgroup -S resolvex && adduser -S resolvex -G resolvex && \
    chown -R resolvex:resolvex /app

USER resolvex

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
