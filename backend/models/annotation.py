# -*- coding: utf-8 -*-

"""Annotation model."""

from user import User
from datetime import datetime
from motorengine import Document, fields


class Annotation(Document):
    """Annotation document.

    Attributes:
        data: Annotation in JSON format.
        author:  Author of the annotation.
        timestamp:  Time of annotation.
    """

    __collection__ = "annotations"

    data = fields.JsonField(required=True)
    author = fields.ReferenceField(reference_document_type=User)
    timestamp = fields.DateTimeField(default=datetime.utcnow())
