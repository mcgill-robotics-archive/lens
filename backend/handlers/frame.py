# -*- coding: utf-8 -*-

"""Image handler."""

from models import Frame
from helpers import Encoder
from tornado.gen import coroutine
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.2.0"


class NextFrameHandler(RequestHandler):

    """Next frame request handler."""

    @coroutine
    def get(self):
        """Returns next frame information.

        Parameters:
            previous: Unique object ID of previously viewed frame.

        Returns:
            application/json if found, 404 otherwise.

            For example:
                {
                    'id': unique frame ID,
                    'video': {
                        'id': unique video ID,
                        'name': video name,
                        'location': location,
                        'recorded': datetime recorded in ISO 8601,
                        'added': datetime added in ISO 8601
                    },
                    'index': frame index,
                    'tags': list of tags,
                    'metadata': list of JSON metadata,
                    'accessed': datetime last accessed in ISO 8601,
                    'added': datetime added in ISO 8601
                }
        """
        previous = self.get_argument("previous", None)
        frame = yield Frame.next(previous)

        if not frame:
            self.set_status(404)
            self.write_error(404)
            return

        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame.dump()))
