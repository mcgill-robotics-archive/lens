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
  this.aspectRatio;

  // Request the next frame
  var req = new XMLHttpRequest();
  req.addEventListener('load', setBackgroundImage);
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
    Lens.image.fitToPage();
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
Frame.prototype.fitToPage = function () {
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

  var currentHeight = image.clientHeight || image.parentElement.clientHeight;
  var currentWidth = image.clientWidth || image.parentElement.clientWidth;

  // Get the x and y scale factor
  var scaleFactorX = currentWidth / prevWidth;
  var scaleFactorY = currentHeight / prevHeight;

  // We also need to update the annotations, which we will do based on the
  // effective scale factor of the image.
  Lens.annotations.forEach(function(annotation, index, set) {
    // Determine the new coordinates
    var x = annotation.x * imageWidth * scaleFactorX;
    var y = annotation.y * imageHeight * scaleFactorY;
    var width = annotation.width * imageWidth * scaleFactorX;
    var height = annotation.height * imageHeight * scaleFactorY;

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
