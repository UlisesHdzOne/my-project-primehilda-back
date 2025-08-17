# ======== Etapa 1: Builder ========
FROM node:20-alpine AS builder

# Pasar variables de build
ARG DATABASE_URL
ARG PORT

ENV DATABASE_URL=$DATABASE_URL
ENV PORT=$PORT
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache python3 make g++ bash

# Copiar archivos de package
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install --include=dev

# Copiar archivos de Prisma
COPY prisma ./prisma

# Copiar scripts
COPY scripts ./scripts

# Copiar código fuente
COPY src ./src
COPY tsconfig*.json ./

# Ejecutar validaciones de entorno (prebuild)
RUN npm run prebuild

# Construir el proyecto
RUN npm run build

# ======== Etapa 2: Runtime ========
FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

# Copiar solo lo necesario desde builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["node", "dist/main"]
