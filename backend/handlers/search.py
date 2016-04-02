# -*- coding: utf-8 -*-

"""Search handler."""

import logging
from helpers import Encoder
from models import Frame, Tag
from tornado.gen import coroutine
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class SearchByTagHandler(RequestHandler):

    """Search by tag request handler."""

    @coroutine
    def get(self, tag_name):
        """Annotates and tags a frame.

        Args:
            tag_name: Tag name.

        Returns:
            A list of frame IDs.
            application/json if successfull, 404 otherwise.
        """
        logging.debug("Searching for frames tagged as: %s", tag_name)

        tag = yield Tag.from_name(tag_name)
        frames = yield Frame.objects.filter(tag__eq=tag).find_all()

        if not frames:
            self.set_status(404)
            self.write_error(404)
            return

        frame_ids = [frame._id for frame in frames]

        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame_ids))
