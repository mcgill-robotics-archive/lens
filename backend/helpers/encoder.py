# -*- coding: utf-8 -*-

"""Video feed handler."""

import json
import datetime

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return str(obj)
        elif isinstance(obj, datetime.date):
            return str(obj)
        elif isinstance(obj, datetime.timedelta):
            return str(datetime.datetime.min + obj)
        else:
            return super(Encoder, self).default(obj)
