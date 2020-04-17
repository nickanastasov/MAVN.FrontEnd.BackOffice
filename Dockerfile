# extracted build into github workflow
FROM nginx:1.13.12-alpine

# https://docs.docker.com/engine/reference/builder/#copy
COPY nginx/root.html /usr/share/nginx/html/
COPY dist/token-platform-backoffice /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
