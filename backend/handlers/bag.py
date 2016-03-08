# -*- coding: utf-8 -*-

"""ROS bag handler."""

import os
import uuid
import rosbag
import logging
import dateutil.parser
from helpers import Encoder
from tornado.gen import coroutine
from models import Bag, Feed, Frame
from tornado.web import RequestHandler

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class BagHandler(RequestHandler):

    """ROS bag request handler."""

    UPLOADS = "/tmp/"

    @coroutine
    def get(self):
        """Renders bag uploading template."""
        self.render("bag.html")

    @coroutine
    def post(self):
        """Writes uploaded bag to the database.

        Properties:
            name: Bag name.
            robot: Robot name.
            location: Location taken.
            conditions: List of conditions.
            recorded: Datetime recorded as ISO 8601.

        Returns:
            application/json of the video properties.

            For example:
                {
                    'id': unique bag ID,
                    'name': bag name,
                    'robot': robot name,
                    'location': location,
                    'conditions': list of conditions,
                    'recorded': datetime recorded in ISO 8601,
                    'added': datetime added in ISO 8601
                }
        """
        # Get form data.
        name = self.get_argument("name")
        robot = self.get_argument("robot")
        location = self.get_argument("location")
        conditions = self.get_argument("conditions").split(" ")
        recorded = dateutil.parser.parse(self.get_argument("recorded"))

        # Get file.
        fileinfo = self.request.files["bag"][0]
        fname = fileinfo["filename"]
        extn = os.path.splitext(fname)[1]
        cname = str(uuid.uuid4()) + extn
        self.path = os.path.join(BagHandler.UPLOADS, cname)

        # Save to temporary file.
        f = open(self.path, "w")
        data = fileinfo["body"]
        logging.warn("Writing %d bytes to %s", len(data), self.path)
        f.write(data)

        # Write bag properties to database.
        self.bag = yield Bag.from_ros_bag(
            name=name,
            robot=robot,
            location=location,
            conditions=conditions,
            recorded=recorded
        )

        # Respond.
        self.set_header("Content-Type", "application/json")
        self.finish(Encoder().encode(self.bag.dump()))

        # Write frames to database in the background.
        yield self.write_frames()

    @coroutine
    def write_frames(self):
        """Writes image frames to the database in the backgroumd."""
        # Open ROS bag.
        bag = rosbag.Bag(self.path)

        # Filter to only get image feeds.
        def images_pls(topic, datatype, md5sum, msg_def, header):
            return datatype == "sensor_msgs/Image"

        # Iterate through all ROS Images and write them to the database.
        feeds = {}
        for topic, msg, t in bag.read_messages(connection_filter=images_pls):
            if topic in feeds:
                feed = feeds[topic]
            else:
                feed = yield Feed.from_topic(self.bag, topic)
                feeds[topic] = feed

            yield Frame.from_ros_image(
                feed=feed,
                seq=msg.header.seq,
                data=msg
            )

        # Delete temporary file.
        logging.warn("Deleting %s", self.path)
        os.remove(self.path)
