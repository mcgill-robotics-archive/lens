# -*- coding: utf-8 -*-

"""Video model."""

from datetime import datetime
from motorengine import Document, fields
from tornado.gen import coroutine, Return

__author__ = "Anass Al-Wohoush"
__version__ = "0.2.0"


class Video(Document):

    """Video feed document.

    Attributes:
        name: Video name.
        description: Video description.
        location: Location recorded.
        recorded: Datetime recorded in UTC.
        added: Datetime added to the database in UTC.
    """

    __collection__ = "videos"

    name = fields.StringField(required=True)
    description = fields.StringField(required=True)
    location = fields.StringField(required=True)
    recorded = fields.DateTimeField(required=True)
    added = fields.DateTimeField(default=datetime.utcnow())

    def dump(self):
        """Returns dictionary representation of video information."""
        return {
            "id": str(self._id),
            "name": self.name,
            "description": self.description,
            "location": self.location,
            "recorded": self.recorded,
            "added": self.added
        }

    @classmethod
    @coroutine
    def from_form(cls, name, description, location, recorded):
        """Creates a Video from form data and writes it to the database.

        Args:
            name: Video name.
            description: Video description.
            location: Location taken.
            recorded: Datetime recorded in UTC.

        Returns:
            Video.
        """
        video = yield Video.objects.create(
            name=name,
            description=description,
            location=location,
            recorded=recorded
        )
        raise Return(video)
