# -*- coding: utf-8 -*-

"""Lens Backend Handlers."""

from image import ImageHandler
from lensui import LensUIHandler
from metadata import MetadataHandler
from search import SearchByTagHandler
from nextframe import NextFrameHandler
from bag import BagHandler, BagsHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


def get_handlers():
    handlers = [
        (r"/?", LensUIHandler),
        (r"/next/?", NextFrameHandler),
        (r"/image/(.+)/?", ImageHandler),
        (r"/annotate/(.+)?", MetadataHandler),
        (r"/bags/?", BagsHandler),
        (r"/bag/?", BagHandler),
        (r"/success/?", BagHandler),
        (r"/search/by-tag/(.+)/?", SearchByTagHandler)
    ]

    return handlers
