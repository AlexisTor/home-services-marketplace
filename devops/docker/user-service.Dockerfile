# devops/docker/user-service.Dockerfile
FROM node:16-alpine
ARG USER_SERVICE_PORT=3001
WORKDIR /app

COPY backend/user-service/package*.json ./

RUN npm install

COPY backend/user-service ./

EXPOSE ${USER_SERVICE_PORT}

CMD ["node", "src/index.mjs"]
