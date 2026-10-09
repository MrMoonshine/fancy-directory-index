FROM docker.io/php:8.3-rc-apache-bookworm
COPY . /data/www/fancy-directory-index/
WORKDIR /data/www/fancy-directory-index/

COPY fancy-directory-index.conf /etc/apache2/sites-available/fancy-directory-index.conf
RUN a2ensite fancy-directory-index.conf
RUN a2enmod userdir

RUN chmod -R 777 /data/www/fancy-directory-index/
RUN chmod -R 777 /var/www/html/

#RUN apt update
#RUN apt install -y oxygen-icon-theme
#RUN apt install -y  zlib1g-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libwebp-dev libavif-dev
#RUN docker-php-ext-configure gd --with-webp --with-jpeg --with-avif
#RUN docker-php-ext-install gd  

# Allow large file uploads, given that they will be scaled down by gd library
#RUN echo "upload_max_filesize = 8M" > "$PHP_INI_DIR/conf.d/uploadsize.ini"
#RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"