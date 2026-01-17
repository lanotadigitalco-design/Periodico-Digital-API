# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm via Corepack (mejor que instalar global)
RUN corepack enable

# Dependencies (con cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Source
COPY . .

# Build -> genera dist/
RUN pnpm run build

# ---------- Stage 2: production ----------
FROM node:20-alpine AS prod
WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production
ENV PORT=3001

# Solo deps de producción
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copiamos el build + config que usas
COPY --from=build /app/dist ./dist
COPY --from=build /app/ormconfig.ts ./ormconfig.ts

# (Opcional) si tienes assets estáticos, descomenta y ajusta
# COPY --from=build /app/public ./public

EXPOSE 3001

# Arranque directo (evita líos de scripts/paths)
CMD ["node", "dist/src/main.js"]
