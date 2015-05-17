# -*- coding: utf-8 -*-

"""Image handler."""

import logging
from models import Frame
from helpers import Encoder
from tornado.gen import coroutine
from tornado.escape import json_decode
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class ImageHandler(RequestHandler):

    """Image request handler."""

    @coroutine
    def get(self, frame_id):
        """Returns corresponding frame as JPEG.

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

    @coroutine
    def post(self, frame_id):
        """Annotates and tags a frame.

        Args:
            frame_id: Unique frame object ID.

        Body:
            {
                'metadata': {
                    ...
                },
                'tags': [
                    ...
                ]
            }

        Returns:
            application/json if successfull, 404 otherwise.

            For example:
                {
                    'id': unique frame ID,
                    'video': {
                        'id': unique video ID,
                        'location': location,
                        'recorded': datetime recorded in UTC,
                        'added': datetime added in UTC
                    },
                    'sequence': frame sequence,
                    'tags': list of tags,
                    'metadata': list of JSON metadata,
                    'accessed': datetime last accessed in UTC,
                    'added': datetime added in UTC
                }
        """
        data = json_decode(self.request.body)
        logging.debug("Annotating frame %s with: %r", frame_id, data)

        frame = yield Frame.objects.get(frame_id)

        if not frame:
            self.set_status(404)
            self.write_error(404)
            return

        yield frame.annotate(**data)
        logging.info(
            "Annotated frame %d of %s",
            frame.sequence,
            frame.video.name
        )
        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame.dump()))


class NextImageHandler(RequestHandler):

    """Next image request handler."""

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
                        'location': location,
                        'recorded': datetime recorded in UTC,
                        'added': datetime added in UTC
                    },
                    'sequence': frame sequence,
                    'tags': list of tags,
                    'metadata': list of JSON metadata,
                    'accessed': datetime last accessed in UTC,
                    'added': datetime added in UTC
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
