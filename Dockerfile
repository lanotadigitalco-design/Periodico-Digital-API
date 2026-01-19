# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Habilita pnpm vía Corepack
RUN corepack enable

# Copia manifests primero para cachear mejor
COPY package.json pnpm-lock.yaml ./

# Instala deps (incluye dev para compilar)
RUN pnpm install --frozen-lockfile

# Copia el resto y compila
COPY . .
RUN pnpm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable

# Instala solo deps de producción
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copia el build
COPY --from=builder /app/dist ./dist

EXPOSE 3003

CMD ["node", "dist/src/main.js"]
