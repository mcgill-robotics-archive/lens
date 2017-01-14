# -*- coding: utf-8 -*-

"""Annotation model."""

from .user import User
from datetime import datetime
from motorengine import Document, fields
from tornado.gen import coroutine, Return

__author__ = "Anass Al-Wohoush, Monica Ung"
__version__ = "0.1.0"


class Annotation(Document):
    """Annotation document.

    Attributes:
        data: Annotation in JSON format.
        author:  Author of the annotation.
        timestamp:  Time of annotation.
    """

    __lazy__ = False
    __collection__ = "annotations"

    data = fields.JsonField(required=True)
    author = fields.ReferenceField(reference_document_type=User)
    timestamp = fields.DateTimeField(default=datetime.utcnow())

    def dump(self):
        """Returns dictionary representation of annotation."""
        return {
            "author": self.author.name,
            "timestamp": self.timestamp,
            "data": self.data
        }

    @classmethod
    @coroutine
    def from_json(cls, json, author):
        """Creates an annotation from a JSON blob and writes it to the
        database.

        Args:
            json: JSON blob.

        Returns:
            Annotation.
        """
        annotation = yield Annotation.objects.create(
            data=json,
            author=author
        )
        raise Return(annotation)
