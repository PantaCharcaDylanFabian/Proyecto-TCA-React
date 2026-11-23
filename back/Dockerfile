# Dockerfile de Producción para el Backend TCA
# Soporta Cloud Deployment en Google Cloud Run, AWS ECS o Render

FROM node:20-alpine

WORKDIR /app

# Copiar manifiesto de dependencias
COPY package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar código fuente del backend
COPY api/ ./api/
COPY services/ ./services/
COPY scripts/ ./scripts/
COPY ai_analytics/catalogo-depurado.json ./ai_analytics/

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "api/server.js"]
