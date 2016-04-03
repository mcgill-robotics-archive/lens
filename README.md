# McGill Robotics Lens

## Dependencies

To run, this application requires `MongoDB`, and all the dependencies found in
`backend/requirements.txt`.

## NGINX setup

We build NGINX from source because we need a specific upload module that
doesn't come with NGINX by default.

```bash
wget http://nginx.org/download/nginx-1.8.1.tar.gz
tar xvf nginx-1.8.1.tar.gz
wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.38.tar.bz2
tar -xjf pcre-8.38.tar.bz2
git clone -b 2.2 https://github.com/vkholodkov/nginx-upload-module
cd nginx-1.8.1/
./configure --prefix=/etc/nginx --with-http_ssl_module --add-module=../nginx-upload-module --with-pcre=../pcre-8.38/
sudo make
sudo make install
```

Next, backup the default configuration file and use our version by creating a
symbolic link to this project's configuration file.

```bash
sudo mv /etc/nginx/conf/nginx.conf /etc/nginx/conf/nginx.conf.BACKUP
sudo ln -s [YOUR_LENS_PROJECT_PATH]/lens/nginx/nginx.conf /etc/nginx/conf/nginx.conf
sudo /etc/nginx/sbin/nginx -s reload
```

Create directory for logging in `/var/log`.

```bash
sudo mkdir /var/log/nginx
```

## Running

From the `backend` folder, run:

```bash
python app.py
```

## Help

From the `backend` folder, run:

```bash
python app.py --help
```
