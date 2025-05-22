# devops/docker/web-frontend.Dockerfile
FROM node:16-alpine as build
ARG FRONTEND_PORT=80

WORKDIR /app

COPY frontend/web/package*.json ./

RUN npm install

COPY frontend/web ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY devops/docker/assets/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE ${FRONTEND_PORT}

CMD ["nginx", "-g", "daemon off;"]
