# Stage 1: use Node to install locked dependencies and compile React/Vite into static files.
FROM node:22-alpine AS build

WORKDIR /app

# The app is nested in the pintrest/ directory under this build context.
COPY pintrest/package*.json ./
RUN npm ci

COPY pintrest/ ./
RUN npm run build

# Stage 2: the final, smaller runtime serves only the compiled files with Apache.
FROM httpd:2.4-alpine

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/
COPY apache.conf /usr/local/apache2/conf/extra/apache.conf
RUN echo 'Include conf/extra/apache.conf' >> /usr/local/apache2/conf/httpd.conf

# Document Apache's container port; publishing to the host still uses docker run -p.
EXPOSE 80

CMD ["httpd-foreground"]
