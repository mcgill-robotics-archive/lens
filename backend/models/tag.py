# -*- coding: utf-8 -*-

"""Tag model."""

from motorengine import Document, fields
from tornado.gen import coroutine, Return

__author__ = "Monica Ung, Anass Al-Wohoush"
__version__ = "0.1.0"


class Tag(Document):
    """Tag document.

    Attributes:
        name: Tag name.
    """

    __collection__ = "tags"

    name = fields.StringField(required=True)

    def dump(self):
        """Returns dictionary representation of a Tag."""
        return self.name

    @classmethod
    @coroutine
    def from_tag(cls, name):
        """Creates a tag and writes it to the database.

        Args:
            name: tag name.

        Returns:
            Tag.
        """
        # Look up if tag already exists.
        tags = yield Tag.objects.filter(name=name).limit(1).find_all()
        if tags:
            raise Return(tags[0])

        # Otherwise, create a new one.
        tag = yield Tag.objects.create(name=name)
        raise Return(tag)
