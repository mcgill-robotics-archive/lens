McGill Robotics Lens
====================

Dependencies
------------
To run, this application requires `MongoDB`, `ffmpeg`, `NGINX` and all the
dependencies found in `requirements.txt`.

NGINX setup
-----------
Create a symbolic link to this project's nginx configuration file.  You may want
to backup your original nginx.conf first.

```
sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.BACKUP
sudo ln -s [YOUR_LENS_PROJECT_PATH]/lens/nginx/nginx.conf /etc/nginx/nginx.conf
sudo service nginx reload
```

Running
-------
From the `backend` folder, run:
```bash
python app.py
```

Help
----
From the `backend` folder, run:
```bash
python app.py --help
```
