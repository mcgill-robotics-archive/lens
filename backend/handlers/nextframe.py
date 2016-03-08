# -*- coding: utf-8 -*-

"""Next frame request handler."""

from models import Frame
from helpers import Encoder
from tornado.gen import coroutine
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


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
                    'feed': {
                        'id': unique Feed ID,
                        'bag': unique Bag ID,
                        'topic': ROS topic name,
                        'available_tags': list of available tags
                    },
                    'seq': frame sequence number,
                    'tags': list of tags,
                    'annotations': list of JSON metadata,
                    'accessed': datetime last accessed in ISO 8601
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
