# -*- coding: utf-8 -*-

"""Tag model."""

from motorengine import Document, fields


class Tag(Document):
    """Tag document.

    Attributes:
        name: Tag name.
    """

    __collection__ = "users"

    name = fields.StringField(required=True)
