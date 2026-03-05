# Etap 1: Instalacja zależności
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etap 2: Budowanie aplikacji
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Budujemy aplikację - Next.js wymaga teraz Node 20+
RUN npm run build

# Etap 3: Uruchomienie (Lekki obraz produkcyjny)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Tworzymy foldery na dane i ustawiamy uprawnienia dla użytkownika node
RUN mkdir -p data public/uploads && chown -R node:node data public/uploads

# Kopiujemy niezbędne pliki z etapu builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000
CMD ["node", "server.js"]