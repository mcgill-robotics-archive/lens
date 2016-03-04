# -*- coding: utf-8 -*-

"""User model."""

from motorengine import Document, fields


class User(Document):
    """User document.

    Attributes:
        name: User's name.
        points:  Points collected.
    """

    __collection__ = "users"

    name = fields.StringField(required=True)
    points = fields.IntField()
