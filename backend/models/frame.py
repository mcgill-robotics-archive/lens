# -*- coding: utf-8 -*-

"""Frame model."""

import cv2
import six
import base64
import logging
import numpy as np
from tag import Tag
from feed import Feed
from toro import Lock
from bson import Binary
from cv_bridge import CvBridge
from annotation import Annotation
from datetime import datetime, timedelta
from tornado.gen import coroutine, Return
from motorengine import Document, fields, Q

__author__ = "Anass Al-Wohoush, Monica Ung"

lock = Lock()


class ImageField(fields.BinaryField):

    """Custom image field."""

    def validate(self, value):
        """Overriding default BinaryField validation to allow more data types.

        Args:
            value: Field value to validate.

        Returns:
            True if value is valid, False otherwise.
        """
        if not isinstance(value, (six.binary_type, six.text_type, Binary)):
            return False
        if self.max_bytes is not None and len(value) > self.max_bytes:
            return False
        return True


class Frame(Document):

    """Image frame document.

    Attributes:
        tags: List of tags.
        feed: Corresponding feed.
        data: Image data.
        annotations: List of annotations.
        accessed: Datetime accessed in UTC, an indicator of whether in use.
    """

    __lazy__ = False
    __collection__ = "frames"

    tags = fields.ListField(fields.ReferenceField(Tag))
    feed = fields.ReferenceField(reference_document_type=Feed)
    seq = fields.IntField(required=True)
    data = ImageField(required=True)
    annotations = fields.ListField(fields.ReferenceField(Annotation))
    accessed = fields.DateTimeField()

    def dump(self):
        """Returns dictionary representation of frame information."""
        # Get image size.
        img = self.parse_image()
        height, width = img.shape[:2]

        return {
            "id": str(self._id),
            "tags": [x.dump() for x in self.tags],
            "feed": self.feed.dump(),
            "seq": self.seq,
            "height": height,
            "width": width,
            "annotations": [x.dump() for x in self.annotations],
            "accessed": self.accessed,
        }

    @coroutine
    def use(self):
        """Updates last accessed time."""
        # Avoid setting this while querying for next frame.
        with (yield lock.acquire()):
            # Update timestamp.
            self.accessed = datetime.utcnow()
            yield self.save()

    @classmethod
    @coroutine
    def next(cls):
        """Returns the optimal next frame to annotate.

        Returns:
            Non-annotated frame.
        """
        def prepare_query():
            """Returns filter for frames with no metadata and who have not been
            accessed lately.
            """
            # Find the first non-annotated frame that hasn't been accessed in
            # the past 10 minutes.
            cache = datetime.utcnow() - timedelta(minutes=1)
            return (
                Q({"annotations": {"$size": 0}}) &
                (Q(accessed__is_null=True) | Q(accessed__lt=cache))
            )

        # Avoid querying for next frame while marking another frame in use.
        with (yield lock.acquire()):
            query = prepare_query()
            frames = yield Frame.objects.filter(query).limit(1).find_all()
            next_frame = frames[0] if frames else None

        # Return the frame if found and mark as in use.
        if next_frame:
            yield next_frame.use()
            raise Return(next_frame)

    @coroutine
    def annotate(self, annotations, tags):
        """Updates the frame's annotations.

        Args:
            annotations: Annotations.
            tags: List of tags.
        """
        # Avoid concurrently overwriting a frame's annotations.
        with (yield lock.acquire()):
            self.annotations.extend(annotations)
            self.tags.extend(tags)
            self.tags = list(set(self.tags))
            yield self.save()

    @classmethod
    @coroutine
    def from_ros_image(cls, feed, seq, msg):
        """Creates a Frame from a ROS sensor_msgs/Image and writes it to the
        database.

        Args:
            feed: Corresponding feed.
            seq: Frame sequence in feed.
            msg: ROS Image.

        Returns:
            Frame.
        """
        # Convert ROS Image to OpenCV image.
        bridge = CvBridge()
        img = bridge.imgmsg_to_cv2(msg, desired_encoding="passthrough")

        # Convert to PNG with highest level of compression.
        # Although high quality compression is slower, it is acceptable since
        # these images are read more often than they are written.
        # PNG is a lossless format, so this can be retrived as a ROS image
        # without issue.
        compression = [cv2.IMWRITE_PNG_COMPRESSION, 9]
        img = cv2.imencode('.png', img, compression)[1].tostring()

        frame = yield Frame.objects.create(
            feed=feed,
            seq=seq,
            data=base64.b64encode(img)
        )
        raise Return(frame)

    def parse_image(self):
        """Parses image into OpenCV image.

        Returns:
            OpenCV Image.
        """
        nparr = np.fromstring(base64.b64decode(self.data), np.uint8)
        img = cv2.imdecode(nparr, cv2.CV_LOAD_IMAGE_COLOR)

        return img

    @coroutine
    def to_jpeg(self):
        """Returns a JPEG image of the frame.

        Returns:
            JPEG encoded byte string.
        """
        img = self.parse_image()

        # Convert to JPEG.
        raise Return(cv2.imencode('.jpg', img)[1].tostring())
