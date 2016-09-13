# -*- coding: utf-8 -*-

"""Lens UI."""

from tornado.gen import coroutine
from tornado.web import RequestHandler
import json

__author__ = "Malcolm Watt"
__version__ = "0.1.0"

class LensUIHandler(RequestHandler):
    
    @coroutine
    def get(self):
        """ Handles annotation tool application template dispatch
        """
        self.render('annotate.html')

