'use strict';

/* global Annotation, Lens */

/**
 * Constructs a frame object which gets a new frame from the database and
 * sets up appropriate layout handlers.
 *
 * @author Malcolm Watt
 * @constructor
 */
function Frame () {
  this.container = document.getElementById('annotate-img');
  this.container.onresize = this.resizeAnnotations;
  this.aspectRatio;

  // Request the next frame
  var req = new XMLHttpRequest();
  req.addEventListener('load', this.setBackgroundImage);
  // Make an assynchronous request for the next frame
  req.open("GET", '/next', true);
  req.send();
}


/**
 * Sets the `background-img` property of the main SVG tag.
 *
 * @author Malcolm Watt
 * @return undefined
 */
Frame.prototype.setBackgroundImage = function () {
  var frameInfo = JSON.parse(this.responseText);
  Lens.frameId = frameInfo.id;
  var url = '/image/' + Lens.frameId;
  Lens.image.container.style.backgroundImage = 'url(' + url + ')';
  var img = document.createElement('img');
  img.onload = function () {
    Lens.image.aspectRatio = img.width / img.height;
    Lens.image.resizeFrame();
  }
  img.src = url;
};


/**
 * Dynamically fits the frame to the user's page to allow easy annotation of
 * frames. Maintains aspect ratio.
 *
 * @author Malcolm Watt
 * @return undefined
 */
Frame.prototype.resizeFrame = function () {
  var image = document.getElementById('annotate-img');
  var prevHeight = image.clientHeight || image.parentElement.clientHeight;
  var prevWidth = image.clientWidth || image.parentElement.clientWidth;

  image.style.backgroundSize = 'cover';

  image.style.width = "100%";

  var pageHeight = Number(window.innerHeight);
  image.style.height = pageHeight + "px";

  // Now we need to check the aspect ratio and adjust accordingly
  var imageWidth = image.clientWidth || image.parentElement.clientWidth;
  var imageHeight = image.clientHeight || image.parentElement.clientHeight;
  var aspectRatio = imageWidth / imageHeight;

  if (aspectRatio > Lens.image.aspectRatio) {
    // Limiting factor is height
    var adjustedWidth = imageHeight * Lens.image.aspectRatio;
    var adjustedWidthPercentage = adjustedWidth / imageWidth;
    image.style.width = adjustedWidthPercentage * 100 + '%';
  } else {
    // Limiting factor is width
    var adjustedHeight = imageWidth / Lens.image.aspectRatio;
    image.style.height = adjustedHeight + 'px';
  }
};


/**
 * Remake the annotation borders based on the newly resized image.
 *
 * @author Malcolm Watt
 * @return undefined
 */
Frame.prototype.resizeAnnotations = function() {
  var image = document.getElementById('annotate-img');

  var currentHeight = image.clientHeight || image.parentElement.clientHeight;
  var currentWidth = image.clientWidth || image.parentElement.clientWidth;

  // Now we re-write the annotations based on the adjusted size of the image
  Lens.annotations.forEach(function(annotation, index, set) {
    var x = annotation.x * imageWidth;
    var y = annotation.y * imageHeight;
    var width = annotation.width * imageWidth;
    var height = annotation.height * imageHeight;

    // Remove the old svg element
    var previousBoxElement = annotation.boxElement;
    annotation.svgGroup.removeChild(previousBoxElement);

    // Draw a new svg element
    switch (annotation.type) {
      case 'rectangle':
        annotation.boxElement = annotation.drawBox(x, y, width, height);
        break;
      case 'ellipse':
      default:
        annotation.boxElement = annotation.drawEllipse(x, y, width, height);
        break;
    }

    // Add the newly created svg element
    annotation.svgGroup.appendChild(annotation.boxElement);
  });
};
