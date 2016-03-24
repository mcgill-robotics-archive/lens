# -*- coding: utf-8 -*-

"""Lens Backend Handlers."""

from bag import BagHandler
from image import ImageHandler
from lensui import LensUIHandler
from metadata import MetadataHandler
from homepage import HomePageHandler
from nextframe import NextFrameHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


def get_handlers():
    handlers = [
        (r"/?", HomePageHandler),
        (r"/next/?", NextFrameHandler),
        (r"/image/(.+)/?", ImageHandler),
        (r"/annotate/(.+)?", MetadataHandler),
        (r"/bag/?", BagHandler),
        (r"/success/?", BagHandler),
        (r"/lens/?", LensUIHandler),
    ]

    return handlers
