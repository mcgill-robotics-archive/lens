# -*- coding: utf-8 -*-

"""Image handler."""

import logging
from models import Frame
from helpers import Encoder
from tornado.gen import coroutine
from tornado.escape import json_decode
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


class MetadataHandler(RequestHandler):

    """Metadata request handler."""

    @coroutine
    def post(self, frame_id):
        """Annotates and tags a frame.

        Args:
            frame_id: Unique frame object ID.

        Body:
            {
                'frame_id': Unique frame ObjectId,
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
            frame.index,
            frame.video.name
        )
        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame.dump()))
