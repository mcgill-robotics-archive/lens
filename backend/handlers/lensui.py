# -*- coding: utf-8 -*-

"""Lens UI."""

from tornado.gen import coroutine
from tornado.web import RequestHandler
from image import ImageHandler
from frame import NextFrameHandler
from helpers import Encoder
from models import Frame
import json

__author__ = "Malcolm Watt"
__version__ = "0.0.1"

class LensUIHandler(RequestHandler):

    """Main page handler."""

    @coroutine
    def get(self):
        """Renders lens UI"""
        self.render('lens.html')

    @coroutine
    def post(self):
        pass
