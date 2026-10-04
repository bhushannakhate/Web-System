FROM node:22-alpine AS build

WORKDIR /app

# The app is in the nested pintrest/ directory; install from the lockfile first.
COPY pintrest/package*.json ./
RUN npm ci

COPY pintrest/ ./
RUN npm run build

FROM httpd:2.4-alpine

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
COPY apache.conf /usr/local/apache2/conf/extra/apache.conf
RUN echo 'Include conf/extra/apache.conf' >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80

CMD ["httpd-foreground"]
