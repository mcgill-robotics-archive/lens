# -*- coding: utf-8 -*-

"""Video handler."""

import os
import uuid
import logging
from PIL import Image
from bson import Binary
from helpers import Encoder
from datetime import datetime
from cStringIO import StringIO
from models import Frame, Video
from tornado.gen import coroutine
from tornado.web import RequestHandler
from moviepy.editor import VideoFileClip

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class VideoHandler(RequestHandler):

    """Image request handler."""

    UPLOADS = "/tmp/"

    @coroutine
    def get(self):
        """Renders video uploading template."""
        self.render("video.html")

    @coroutine
    def post(self):
        """Writes uploaded video to the database.

        Properties:
            name: Video name.
            description: Video description.
            location: Location taken.
            recorded: Datetime recorded as 'YYYY-mm-ddTHH:MM'.

        Returns:
            application/json of the video properties.

            For example:
                {
                    'id': unique video ID,
                    'location': location,
                    'recorded': datetime recorded in UTC,
                    'added': datetime added in UTC
                }
        """
        # Get form data.
        name = self.get_argument("name")
        description = self.get_argument("description")
        location = self.get_argument("location")
        recorded = datetime.strptime(
            self.get_argument("recorded"),
            "%Y-%m-%dT%H:%M"
        )

        # Get file.
        fileinfo = self.request.files["filearg"][0]
        fname = fileinfo["filename"]
        extn = os.path.splitext(fname)[1]
        cname = str(uuid.uuid4()) + extn
        self.path = os.path.join(VideoHandler.UPLOADS, cname)

        # Save to temporary file.
        f = open(self.path, "w")
        data = fileinfo["body"]
        logging.warn("Writing %d bytes to %s", len(data), self.path)
        f.write(data)

        # Write video properties to database.
        self.video = yield Video.from_form(
            name=name,
            description=description,
            location=location,
            recorded=recorded
        )

        # Respond.
        self.set_header("Content-Type", "application/json")
        self.finish(Encoder().encode(self.video.dump()))

        # Write frames to database in the background.
        yield self.write_frames()

        # Delete temporary file.
        logging.warn("Deleting %s", self.path)
        os.remove(self.path)

    @coroutine
    def write_frames(self):
        """Writes video frames to the database in the backgroumd."""
        # Open video.
        v = VideoFileClip(self.path)

        # Iterate through frames.
        for sequence, image in enumerate(v.iter_frames()):
            # Compress as JPEG.
            jpeg = StringIO()
            Image.fromarray(image).save(jpeg, "jpeg")

            # Write frame to database.
            logging.info("Adding frame %d to %s", sequence, self.video.name)
            yield Frame.from_image(
                video=self.video,
                sequence=sequence,
                image=Binary(jpeg.getvalue())
            )
