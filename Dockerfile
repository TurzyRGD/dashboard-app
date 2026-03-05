# Zoptymalizowany pod kątem wagi (Alpine)
#FROM node:18-alpine AS base

# Etap 1: Instalacja zależności
#FROM base AS deps
#RUN apk add --no-cache libc6-compat
#WORKDIR /app
#COPY package.json package-lock.json ./
#RUN npm ci

# Etap 2: Budowanie aplikacji
#FROM base AS builder
#WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
#COPY . .
#RUN npm run build

# Etap 3: Uruchomienie produkcyjne
#FROM base AS runner
#WORKDIR /app
#ENV NODE_ENV production
#ENV PORT 3000

#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

#COPY --from=builder /app/public ./public
#COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
#COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

#USER nextjs
#EXPOSE 3000

#CMD ["node", "server.js"]
# Etap 1: Instalacja zależności
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etap 2: Budowanie aplikacji
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etap 3: Uruchomienie (Lekki obraz produkcyjny)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000

# Tworzymy foldery, które będą trzymać nasze trwałe dane
RUN mkdir -p /app/data && mkdir -p /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Uruchamiamy jako domyślny użytkownik Node, aby upewnić się, że nie ma problemu z uprawnieniami
EXPOSE 3000
CMD ["node", "server.js"]