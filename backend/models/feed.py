# -*- coding: utf-8 -*-

"""Feed model."""

from tag import Tag
from bag import Bag
from tornado.gen import coroutine, Return
from motorengine import Document, fields, Q

__author__ = "Monica Ung, Anass Al-Wohoush"
__version__ = "0.1.0"


class Feed(Document):
    """Image feed document.

    Attributes:
        bag: Bag of the feed.
        topic: ROS topic name.
        available_tags: List of tags available for the feed.
    """

    __collection__ = "feeds"
    __lazy__ = False

    bag = fields.ReferenceField(reference_document_type=Bag)
    topic = fields.StringField(required=True)
    available_tags = fields.ListField(fields.ReferenceField(Tag))

    def dump(self):
        """Returns dictionary representation of feed information."""
        return {
            "id": str(self._id),
            "bag": self.bag.dump(),
            "topic": self.topic,
            "available_tags": self.available_tags
        }

    @classmethod
    @coroutine
    def from_topic(cls, bag, topic):
        """Creates a feed from a topic and writes it to the database.

        Args:
            bag: Bag that the feed belongs to.
            topic: ROS topic name.

        Returns:
            Feed.
        """
        # Look up if the feed already exists.
        query = Q(bag=bag) & Q(topic=topic)
        feeds = yield Feed.objects.filter(query).limit(1).find_all()
        if feeds:
            raise Return(feeds[0])

        # Otherwise, create a new one.
        feed = yield Feed.objects.create(
            bag=bag,
            topic=topic,
            available_tags=[]
        )
        raise Return(feed)

    @coroutine
    def add_tag(self, tag):
        """Adds an available tag to a feed.

        Args:
            tag: Possible Tag that could be seen in the feed.
        """
        self.available_tags.append(tag)
        yield self.save()
