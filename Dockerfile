# Stage 1
FROM node:10-alpine as node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# RUN npm run build:ar
# RUN npm run build:en
# now use parallel building for both languages
RUN npm run build

# Stage 2
FROM nginx:1.13.12-alpine

# https://docs.docker.com/engine/reference/builder/#copy
COPY --from=node /usr/src/app/nginx/root.html /usr/share/nginx/html/
COPY --from=node /usr/src/app/dist/token-platform-backoffice /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
