# -*- coding: utf-8 -*-

"""Frame model."""

import six
import pickle
import logging
from tag import Tag
from feed import Feed
from toro import Lock
from bson import Binary
from annotation import Annotation
from datetime import datetime, timedelta
from tornado.gen import coroutine, Return
from motorengine import Document, fields, Q

__author__ = "Anass Al-Wohoush, Monica Ung"
__version__ = "0.4.0"

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
        return {
            "id": str(self._id),
            "tags": [x.dump() for x in self.tags],
            "feed": self.feed.dump(),
            "seq": self.seq,
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
    def next(cls, previous=None):
        """Returns the optimal next frame to annotate.

        Args:
            previous: Object Id of previous frame annotated.

        Returns:
            Non-annotated frame.
        """
        def prepare_query():
            """Returns filter for frames with no metadata and who have not been
            accessed lately.
            """
            # Find the first non-annotated frame that hasn't been accessed in
            # the past 10 minutes.
            cache = datetime.utcnow() - timedelta(minutes=10)
            return (
                Q({"annotations": {"$size": 0}}) &
                (Q(accessed__is_null=True) | Q(accessed__lt=cache))
            )

        # Look for optimal frame following the previously annotated one.
        if previous:
            # Mark previous frame as used in order to prevent it from appearing
            # as a next frame if no frame from the same video is found.
            previous_frame = yield Frame.objects.get(id=previous)
            previous_frame.use()

            # Avoid querying for next frame while marking another frame in use.
            with (yield lock.acquire()):
                # Find next non-annotated frame from the same video with a
                # greater index.
                query = prepare_query() & Q(feed=previous_frame.feed)
                next_frame = yield Frame.objects.filter(query).get(
                    seq__gt=previous_frame.seq
                )

            # Return the frame if found and mark as in use.
            if next_frame:
                yield next_frame.use()
                raise Return(next_frame)

            # Find a new unrelated frame if the end of the video has been
            # reached, otherwise.
            logging.warn("Reached end of feed: %s", previous_frame.feed.name)

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
    def annotate(self, annotation, tags):
        """Updates the frame's annotations.

        Args:
            annotation: Annotations.
            tags: List of tags.
        """
        # Avoid concurrently overwriting a frame's annotations.
        with (yield lock.acquire()):
            self.annotations.append(annotation)
            self.tags.extend(tags)
            yield self.save()

    @classmethod
    @coroutine
    def from_ros_image(cls, feed, seq, data):
        """Creates a Frame from a ROS sensor_msgs/Image and writes it to the
        database.

        Args:
            feed: Corresponding feed.
            seq: Frame sequence in feed.
            data: ROS Image.

        Returns:
            Frame.
        """
        frame = yield Frame.objects.create(
            feed=feed,
            seq=seq,
            data=pickle.dumps(data),
        )
        raise Return(frame)

    @coroutine
    def to_jpeg():
        """TODO: Returns a jpeg image of the frame."""
        pass
