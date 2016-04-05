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
            "available_tags": [t.dump() for t in self.available_tags]
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
        )
        raise Return(feed)

    @coroutine
    def add_tag(self, tag):
        """Adds an available tag to a feed.

        Args:
            tag: Possible Tag that could be seen in the feed.
        """
        if not self.exist(tag):
            self.available_tags.append(tag)
            yield self.save()

    @classmethod
    @coroutine
    def get_feeds(self, bag=None):
        """ Returns feeds belonging to a certain bag or returns all feeds if a
            bag is not specified

            Args:
                bag: The bag that you want the feeds of.

            Returns:
                Feeds.
        """
        if bag:
            feeds = yield Feed.objects.filter(bag=bag).find_all()
        else:
            feeds = yield Feed.objects.find_all()
        raise Return(feeds)

    @coroutine
    def clear_tags(self):
        """Clears available_tags."""
        self.available_tags = []
        yield self.save()

    def exist(self, tag):
        """Checks if tag already exists in available_tags.

        Args:
            tag: The tag object that you want to check.

        Returns:
            Boolean.
        """
        for existing_tag in self.available_tags:
            if tag.name == existing_tag.name:
                return True
        return False
