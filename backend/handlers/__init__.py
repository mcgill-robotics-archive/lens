# -*- coding: utf-8 -*-

"""Lens Backend Handlers."""

from video import VideoHandler
from image import ImageHandler, NextImageHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


def get_handlers():
    handlers = [
        (r"/next-image/?", NextImageHandler),
        (r"/image/(.+)/?", ImageHandler),
        (r"/video/?", VideoHandler),
    ]

    return handlers
