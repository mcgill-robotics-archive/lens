# McGill Robotics Lens

## Dependencies

To run, this application, simply install all dependencies and setup your
enviroment by running the following

```bash
./setup.sh
```

## Running

You must first start `nginx` by running the following:

```bash
sudo /etc/nginx/sbin/nginx -s start
```

And then from the `backend` folder, run:

```bash
python app.py --log_to_stderr --log_file_prefix=lens.log
```

## Help

For more options or help, run from the `backend` folder:

```bash
python app.py --help
```
