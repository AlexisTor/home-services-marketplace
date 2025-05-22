# devops/docker/payment-service.Dockerfile
FROM node:16-alpine
ARG PAYMENT_SERVICE_PORT=3004
WORKDIR /app

COPY backend/payment-service/package*.json ./

RUN npm install

COPY backend/payment-service ./

EXPOSE ${PAYMENT_SERVICE_PORT}

CMD ["node", "src/index.js"]
