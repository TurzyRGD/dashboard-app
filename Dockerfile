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

# Kopiujemy pliki standalone (zawierają node_modules i serwer)
COPY --from=builder /app/.next/standalone ./
# Kopiujemy pliki statyczne i publiczne (standalone ich domyślnie nie zawiera)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Tworzymy foldery na dane i uploady oraz ustawiamy uprawnienia dla użytkownika node
# Robimy to po skopiowaniu plików, aby mieć pewność, że uprawnienia są poprawne
RUN mkdir -p data public/uploads && chown -R node:node /app

USER node

EXPOSE 3000
CMD ["node", "server.js"]