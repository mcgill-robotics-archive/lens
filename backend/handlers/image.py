# -*- coding: utf-8 -*-

"""Image handler."""

from models import Frame
from tornado.gen import coroutine
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.2.0"


class ImageHandler(RequestHandler):

    """Image request handler."""

    @coroutine
    def get(self, frame_id):
        """Returns corresponding frame as a JPEG.

        Args:
            frame_id: Unique frame object ID.

        Returns:
            image/jpeg if found, 404 otherwise.
        """
        frame = yield Frame.objects.get(frame_id)

        if not frame:
            self.set_status(404)
            self.write_error(404)
            return

        self.set_header("Content-Type", "image/jpeg")
        self.write(frame.image)
