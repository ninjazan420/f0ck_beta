FROM node:20-alpine AS base

# Installiere Abhängigkeiten nur für Produktionsbuilds
FROM base AS deps
WORKDIR /app

# Kopiere package.json und installiere Abhängigkeiten
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Builder-Image
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Kopiere die Projektdateien inklusive .env.production
COPY . .

# Build der Anwendung
RUN npm run build

# Produktions-Image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001

# Erstelle einen non-root Benutzer
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiere die notwendigen Dateien für die Produktion
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.production ./.env.production

# Stelle sicher, dass der Uploads-Ordner existiert und richtige Berechtigungen hat
RUN mkdir -p /app/public/uploads/original /app/public/uploads/thumbnails /app/public/uploads/temp
RUN chmod -R 777 /app/public/uploads
RUN chown -R nextjs:nodejs /app

USER nextjs

# Stelle sicher, dass der Uploads-Ordner als Volume gemounted werden kann
VOLUME /app/public/uploads

# Starte die Anwendung
CMD ["npm", "start"]
