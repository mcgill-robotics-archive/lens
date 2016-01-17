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
    VIEWS_DIR = "./views/"
    SCRIPTS_DIR = "./scripts/"

    def get_template_path(self):
        """ Overide the template path for Lens """
        return "views/annotation_tool"

    @coroutine
    def get(self):
        script_id = self.get_argument('script')
        if (script_id):
            # Check if the script exists, then respond with it if it does
            pass
        else:
            self.render(VIEWS_DIR + 'lens.html')

    @coroutine
    def post(self):
        pass
