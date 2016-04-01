# -*- coding: utf-8 -*-

"""Image handler."""

import logging
from helpers import Encoder
from tornado.gen import coroutine
from tornado.escape import json_decode
from tornado.web import RequestHandler
from models import Annotation, Frame, Tag, User

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
                'annotations': [{
                    ...
                }],
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
        
        user = yield User.from_username("robotics")
        ant_data = data["annotations"]
        annotations = yield [Annotation.from_json(a, user)
                             for a in ant_data]
        tags = yield [Tag.from_tag(s.lower())
                      for s in data["tags"]]

        yield frame.annotate(annotations, tags)
        logging.info(
            "Annotated frame %r of %s",
            str(frame._id),
            frame.feed.topic
        )
        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame.dump()))
