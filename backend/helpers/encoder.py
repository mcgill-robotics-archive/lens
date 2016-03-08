# -*- coding: utf-8 -*-

"""Datetime JSON encoder."""

import json
import datetime

__author__ = "Anass Al-Wohoush"
__version__ = "0.3.0"


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, datetime.date):
            return obj.isoformat()
        elif isinstance(obj, datetime.timedelta):
            return (datetime.datetime.min + obj).isoformat()
        else:
            return super(Encoder, self).default(obj)
