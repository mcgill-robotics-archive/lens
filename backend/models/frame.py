# -*- coding: utf-8 -*-

"""Frame model."""

import six
import logging
from toro import Lock
from bson import Binary
from video import Video
from datetime import datetime, timedelta
from tornado.gen import coroutine, Return
from motorengine import Document, fields, Q

__author__ = "Anass Al-Wohoush"
__version__ = "0.2.0"

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

    """Video image document.

    Attributes:
        video: Corresponding video.
        index: Frame index in video.
        image: JPEG binary data.
        tags: List of tags.
        metadata: List of JSON annotations.
        accessed: Datetime accessed in UTC, an indicator of whether in use.
        added: Datetime added to the database in UTC.
    """

    __lazy__ = False
    __collection__ = "frames"

    video = fields.ReferenceField(reference_document_type=Video)
    index = fields.IntField(required=True)
    image = ImageField(required=True)
    tags = fields.ListField(base_field=fields.StringField())
    metadata = fields.ListField(base_field=fields.JsonField())
    accessed = fields.DateTimeField()
    added = fields.DateTimeField(default=datetime.utcnow())

    def dump(self):
        """Returns dictionary representation of frame information."""
        return {
            "id": str(self._id),
            "video": self.video.dump(),
            "index": self.index,
            "tags": self.tags,
            "metadata": self.metadata,
            "accessed": self.accessed,
            "added": self.added
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
                Q({"metadata": {"$size": 0}})
                & (Q(accessed__is_null=True) | Q(accessed__lt=cache))
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
                query = prepare_query() & Q(video=previous_frame.video)
                next_frame = yield Frame.objects.filter(query).get(
                    index__gt=previous_frame.index
                )

            # Return the frame if found and mark as in use.
            if next_frame:
                yield next_frame.use()
                raise Return(next_frame)

            # Find a new unrelated frame if the end of the video has been
            # reached, otherwise.
            logging.warn("Reached end of video: %s", previous_frame.video.name)

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
    def annotate(self, metadata, tags):
        """Updates the frame's metadata.

        Args:
            metadata: Metadata.
            tags: List of tags.
        """
        # Avoid concurrently overwriting a frame's annotations.
        with (yield lock.acquire()):
            self.metadata.append(metadata)
            self.tags.extend(tags)
            yield self.save()

    @classmethod
    @coroutine
    def from_image(cls, video, index, image):
        """Creates a Frame from image data and writes it to the database.

        Args:
            video: Corresponding video.
            index: Frame index in video.
            image: JPEG binary data.

        Returns:
            Frame.
        """
        frame = yield Frame.objects.create(
            video=video,
            index=index,
            image=image
        )
        raise Return(frame)
