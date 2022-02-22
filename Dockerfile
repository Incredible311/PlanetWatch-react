FROM nginx

COPY dist/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

COPY app/build ./
