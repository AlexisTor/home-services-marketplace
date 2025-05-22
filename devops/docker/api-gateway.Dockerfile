# devops/docker/api-gateway.Dockerfile
FROM node:16-alpine
ARG API_GATEWAY_PORT=3000
WORKDIR /app

COPY backend/api-gateway/package*.json ./

RUN npm install

COPY backend/api-gateway ./

EXPOSE ${API_GATEWAY_PORT}

CMD ["node", "src/index.mjs"]
