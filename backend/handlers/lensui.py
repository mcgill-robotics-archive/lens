# -*- coding: utf-8 -*-

"""Lens UI."""

from tornado.gen import coroutine
from tornado.web import RequestHandler
import json

__author__ = "Malcolm Watt"
__version__ = "0.0.3"

class LensUIHandler(RequestHandler):
    @coroutine
    def prepare(self):
        """ Parse JSON request bodies to allow access to form data.
        """
        is_json_req = self.request.headers["Content-Type"].
            startswith("application/json")

        if self.request.method == "POST" and is_json_req:
            self.json_args = json.loads(self.request.body)
        else
            self.json_args = None


    @coroutine
    def get(self):
        """ Handles annotation tool application template dispatch
        """
        self.render('annotate.html')

    @coroutine
    def post(self):
        """ Writes the metadata for the annotated frame to the database.
        """
        pass
