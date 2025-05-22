# devops/docker/notification-service.Dockerfile
FROM node:16-alpine
ARG NOTIFICATION_SERVICE_PORT=3005
WORKDIR /app

COPY backend/notification-service/package*.json ./

RUN npm install

COPY backend/notification-service ./

EXPOSE ${NOTIFICATION_SERVICE_PORT}

CMD ["node", "src/index.js"]
