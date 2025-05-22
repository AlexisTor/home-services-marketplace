# devops/docker/job-service.Dockerfile
FROM node:16-alpine
ARG JOB_SERVICE_PORT=3002
WORKDIR /app

COPY backend/job-service/package*.json ./

RUN npm install

COPY backend/job-service ./

EXPOSE ${JOB_SERVICE_PORT}

CMD ["node", "src/index.mjs"]
