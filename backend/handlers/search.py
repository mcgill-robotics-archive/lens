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
    def get(self):
        """Annotates and tags a frame.

        Parameters:
            q: Search query (tag name).

        Returns:
            A list of frame IDs.
            application/json if successfull, 404 otherwise.
        """
        tag_name = self.get_argument("q")
        logging.debug("Searching for frames tagged as: %s", tag_name)

        tag = yield Tag.from_tag(tag_name)
        frames = yield Frame.objects.filter({"tags": tag._id}).find_all()

        if not frames:
            self.set_status(404)
            self.write_error(404)
            return

        frame_ids = [str(f._id) for f in frames]

        self.set_header("Content-Type", "application/json")
        self.write(Encoder().encode(frame_ids))
