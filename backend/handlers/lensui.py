# -*- coding: utf-8 -*-

"""Lens UI."""

import logging
from tornado.gen import coroutine
from tornado.web import RequestHandler
from image import ImageHandler
from nextframe import NextFrameHandler
from helpers import Encoder
from models import Frame
import json

__author__ = "Malcolm Watt"
__version__ = "0.0.2"

class LensUIHandler(RequestHandler):
    VIEWS_DIR = "views/"
    SOURCE_DIR = "javascript/"

    def get_template_path(self):
        """ Overide the template path for Lens.
        """
        return "views/annotation_tool"

    @coroutine
    def get(self):
        """ Handles annotation tool application and client script dispatching.
        """
        # scripts are accessed with urls of form : [..]/lens?script=name.js
        script_id = self.get_query_argument('script', None)
        if (script_id):
            self.render(LensUIHandler.SOURCE_DIR + script_id);
        else:
            self.render(LensUIHandler.VIEWS_DIR + 'annotate.html')
