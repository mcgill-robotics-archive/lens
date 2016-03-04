# -*- coding: utf-8 -*-

"""Feed model."""

from datetime import datetime
from motorengine import Document, fields
from tornado.gen import coroutine, Return
from tag import Tag
from bag import Bag

class Feed(Document):
    """Video feed document.

    Attributes:
        bag: Bag of the feed.
        camera: Camera of the feed.
        available_tags: List of tags available for the feed.
    """

    __collection__ = "feeds"

    bag = fields.ReferenceField(reference_document_type=Bag)
    camera = fields.StringField(required=True)
    available_tags = fields.ListField(fields.ReferenceField(Tag))

    def dump(self):
        """Returns dictionary representation of feed information."""
        return {
            "id": str(self._id),
            "bag": self.bag.dump(),
            "camera": self.camera,
            "available_tags": self.available_tags
        }

    @classmethod
    @coroutine
    def from_topic(cls, bag, camera, available_tags):
        """Creates a feed from a topic and writes it to the database.

        Args:
            bag: Bag that the feed belongs to.
            camera: Camera recorded from.
            available_tags: Available tags for the feed.

        Returns:
            Feed.
        """
        feed = yield Feed.objects.create(
            bag=bag,
            camera=camera,
            available_tags=available_tags
        )
        raise Return(feed)
