# -*- coding: utf-8 -*-

"""Bag model."""

from datetime import datetime
from motorengine import Document, fields
from tornado.gen import coroutine, Return

__author__ = "Monica Ung"
__version__ = "0.1.0"


class Bag(Document):
    """Bag document.

    Attributes:
        name: Name of bag.
        robot: Which robot the bag belongs to.
        location: Location of feeds.
        conditions: Conditions of the recordings.
        recorded: Date recorded.
        added: Date added.
    """

    __collection__ = "bags"

    name = fields.StringField(required=True)
    robot = fields.StringField(required=True)
    location = fields.StringField(required=True)
    conditions = fields.ListField(fields.StringField())
    recorded = fields.DateTimeField(required=True)
    added = fields.DateTimeField(default=datetime.utcnow())

    def dump(self):
        """Returns dictionary representation of bag information."""
        return {
            "id": str(self._id),
            "name": self.name,
            "robot": self.robot,
            "location": self.location,
            "conditions": self.conditions,
            "recorded": self.recorded,
            "added": self.added,
        }

    @classmethod
    @coroutine
    def from_ros_bag(cls, name, robot, location, conditions, recorded):
        """Creates a bag and writes it to the database.

        Args:
            name: Name of the bag.
            robot: Which robot the bag belongs to.
            location: Location of feeds.
            conditions: Conditions of the recordings.
            recorded: Date recorded.

        Returns:
            Bag.
        """
        bag = yield Bag.objects.create(
            name=name,
            robot=robot,
            location=location,
            conditions=conditions,
            recorded=recorded
        )
        raise Return(bag)
