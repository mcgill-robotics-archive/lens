# -*- coding: utf-8 -*-

"""Lens Backend Application."""

import logging
from motorengine import connect
from handlers import get_handlers
from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.options import define, options

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"

# Set up command-line arguments.
define("db", default="lens", help="database name")
define("debug", default=False, help="debug mode")
define("host", default="0.0.0.0", help="host to run on")
define("port", default=8888, help="port to run on")


class Backend(Application):

    """Lens backend application."""

    def __init__(self, **kwargs):
        """Constructs Backend application."""
        super(Backend, self).__init__(
            handlers=get_handlers(),
            template_path="/../frontend/views",
            **kwargs
        )


def run():
    """Runs application."""
    options.parse_command_line()

    app = Backend(debug=True, options=options)
    app.listen(options.port, options.host)
    logging.critical("Running on http://{o.host}:{o.port}".format(o=options))

    connect(options.db)
    IOLoop.instance().start()


if __name__ == "__main__":
    run()
