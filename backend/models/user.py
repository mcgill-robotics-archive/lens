# -*- coding: utf-8 -*-

"""User model."""

from motorengine import Document, fields
from tornado.gen import coroutine, Return

__author__ = "Monica Ung, Anass Al-Wohoush"
__version__ = "0.1.0"


class User(Document):
    """User document.

    Attributes:
        name: User's name.
        points:  Points collected.
    """

    __collection__ = "users"

    name = fields.StringField(required=True)
    points = fields.IntField(default=0)

    def dump(self):
        """Returns dictionary representation of user."""
        return {
            "name": self.name,
            "points": self.points
        }

    @classmethod
    @coroutine
    def from_username(cls, name):
        """Creates a user and writes it to the database.

        Args:
            name: Username.

        Returns:
            User.
        """
        # Look up if user already exists.
        users = yield User.objects.filter(name=name).limit(1).find_all()
        if users:
            raise Return(users[0])

        # Otherwise, create a new one.
        user = yield User.objects.create(name=name)
        raise Return(user)

    @coroutine
    def add_points(self, pts):
        """Adds points to the user.

        Args:
            pts: Number of points to increment by.
        """
        self.points += pts
        yield self.save()
