# devops/docker/professional-service.Dockerfile
FROM node:16-alpine
ARG PROFESSIONAL_SERVICE_PORT=3002
WORKDIR /app

COPY backend/professional-service/package*.json ./

RUN npm install

COPY backend/professional-service ./

EXPOSE ${PROFESSIONAL_SERVICE_PORT}

CMD ["node", "src/index.mjs"]
