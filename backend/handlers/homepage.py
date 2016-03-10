# -*- coding: utf-8 -*-

"""Homepage request handler."""

from tornado.gen import coroutine
from tornado.web import RequestHandler

__author__ = "Malcolm Watt"
__version__ = "0.0.1"


class HomePageHandler(RequestHandler):

    """Request handlers for the root directory."""

    @coroutine
    def get(self):
        """Renders the homepage."""
        self.render('index.html')
