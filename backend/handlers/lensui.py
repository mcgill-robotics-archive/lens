# -*- coding: utf-8 -*-

"""Lens UI."""

from tornado.gen import coroutine
from tornado.web import RequestHandler
from image import ImageHandler
from frame import NextFrameHandler
import json

__author__ = "Malcolm Watt"
__version__ = "0.0.1"

class LensUIHandler(RequestHandler):

    """Main page handler."""

    @coroutine
    def get(self):
        """Renders lens UI"""
        imageInfo = NextFrameHandler.objects.get()
        imageId = json.loads(imageInfo)['id']
        image = ImageHandler.objects.get(imageId)
        print(image)
        self.render("lens.html")

    @coroutine
    def post(self):
        pass
