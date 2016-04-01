# -*- coding: utf-8 -*-

"""ROS bag handler."""

import os
import uuid
import rosbag
import logging
import json
import dateutil.parser
from helpers import Encoder
from tornado.gen import coroutine
from models import Bag, Feed, Frame, Tag
from tornado.web import RequestHandler
from urlparse import urlparse, parse_qs

__author__ = "Anass Al-Wohoush"
__version__ = "0.1.0"


class BagHandler(RequestHandler):

    """ROS bag upload request handler."""

    UPLOADS = "/tmp/"

    @coroutine
    def get(self):
        """Renders bag uploading template."""
        self.render("upload-bag.html")

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
        # Get file info of bag that was uploaded by nginx.
        self.name = self.get_argument("bag.name")
        self.path = self.get_argument("bag.path")

        # Get form data from uri.
        uri = self.request.uri
        form_data = parse_qs(urlparse(uri).query)
        name = form_data['name'][0]
        robot = form_data['robot'][0]
        location = form_data['location'][0]
        conditions = form_data['conditions'][0].split(",")
        recorded = dateutil.parser.parse(form_data['recorded'][0])

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
        count = 0
        for topic, msg, t in bag.read_messages(connection_filter=images_pls):
            count += 1
            if not (count % 10):
                continue

            if topic in feeds:
                feed = feeds[topic]
            else:
                feed = yield Feed.from_topic(self.bag, topic)
                feeds[topic] = feed
            logging.warn("Making frames for topic:")
            logging.warn(topic)
            yield Frame.from_ros_image(
                feed=feed,
                seq=msg.header.seq,
                msg=msg
            )

        # Delete temporary file.
        logging.warn("Deleting %s", self.path)
        os.remove(self.path)


class BagsHandler(RequestHandler):

    """ROS bags request handler."""

    @coroutine
    def get(self):
        # Get all bag and feed data to display on web page
        bags = yield Bag.get_bags()
        if not bags:
            self.set_status(404)
            self.write_error(404)
            return
        d = []  # each element is a tuple containing a bag and its feeds
        for bag in bags:
            feeds = yield Feed.get_feeds(bag)
            d.append((bag, feeds))
        self.render("bags.html", d=d)

    @coroutine
    def post(self):
        # Get form data
        bag_id = self.get_argument("id")
        name = self.get_argument("name")
        robot = self.get_argument("robot")
        location = self.get_argument("location")
        conditions = self.get_argument("conditions").split(",")
        # Get bag and update it
        bag = yield Bag.get_bag(bag_id)
        bag.name = name
        bag.robot = robot
        bag.location = location
        bag.conditions = conditions
        bag.save()

        # Save feed information
        related_feeds = yield Feed.get_feeds(bag)
        for feed in related_feeds:
            # Clear existing tags in case any tags were deleted in the form
            feed.clear_tags()
            tags = self.get_argument("tags_" + str(feed._id)).split(" ")
            # Save tags to database
            for tag_name in tags:
                if tag_name:
                    tag = yield Tag.from_tag(tag_name)
                    feed.add_tag(tag)

        # Get all bag and feed data to display on web page
        bags = yield Bag.get_bags()
        if not bags:
            self.set_status(404)
            self.write_error(404)
            return
        d = []  # each element is a tuple containing a bag and its feeds
        for bag in bags:
            feeds = yield Feed.get_feeds(bag)
            d.append((bag, feeds))
        self.render("bags.html", d=d)

    @coroutine
    def get_data(self):
        bags = yield Bag.get_bags()
        feeds = yield Feed.get_feeds()
        d = []  # each element is a tuple containing a bag and its feeds
        for bag in bags:
            feeds = yield Feed.get_feeds(bag)
            d.append((bag, feeds))
        yield d
        return
