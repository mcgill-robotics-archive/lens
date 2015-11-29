# -*- coding: utf-8 -*-

"""Lens Backend Handlers."""

from video import VideoHandler
from image import ImageHandler
from frame import NextFrameHandler
from lensui import LensUIHandler
from metadata import MetadataHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


def get_handlers():
    handlers = [
        (r"/next/?", NextFrameHandler),
        (r"/image/(.+)/?", ImageHandler),
        (r"/annotate/(.+)?", MetadataHandler),
        (r"/video/?", VideoHandler),
        (r"/lens/?", LensUIHandler),
    ]

    return handlers
