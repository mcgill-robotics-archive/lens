#!/bin/bash

# Exit on first error.
set -e

# Ask for sudo privileges.
sudo -K

# Move to temporary storage.
pushd /tmp

# Download nginx 1.8.1.
wget http://nginx.org/download/nginx-1.8.1.tar.gz
tar xvf nginx-1.8.1.tar.gz

# Download PCRE.
wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.38.tar.bz2
tar -xjf pcre-8.38.tar.bz2

# Download nginx-upload-module.
git clone -b 2.2 https://github.com/vkholodkov/nginx-upload-module

# Compile nginx.
pushd nginx-1.8.1/
./configure --prefix=/etc/nginx --with-http_ssl_module \
  --add-module=../nginx-upload-module --with-pcre=../pcre-8.38/
sudo make

# Install nginx.
sudo make install

# Move back to root of repository.
popd
popd

# Link nginx configuration file.
sudo rm -f /etc/nginx/conf/nginx.conf
sudo ln -s $(pwd)/nginx/nginx.conf /etc/nginx/conf/nginx.conf

# Create logging directory.
sudo mkdir -p /var/log/nginx

# Clean up.
sudo rm -rf /tmp/pcre* /tmp/nginx-*

# Install MongoDB.
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install pip dependencies.
sudo -H pip install -r backend/requirements.txt
