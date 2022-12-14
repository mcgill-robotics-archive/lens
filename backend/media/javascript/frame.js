/**
 * @file Implements frontend Frame requests and handling.
 * @author: Malcolm Watt
 * @global: Annotation, Lens
 */

'use strict';

/**
 * Constructs the image object which is basically just a container for
 * the image and the annotation table.
 * @constructor
 */
function Frame () {
  this.container = document.getElementById('annotate-img');
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
 * @this: Reffers to the HTTP response object.
 * @return undefined
 */
Frame.prototype.setBackgroundImage = function () {
  if (this.status !== 500 && this.status !== 404){
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
  } else {
    // Handle errors
  }
};


/**
 * Dynamically fits the frame to the user's page to allow easy annotation of
 * frames. Maintains aspect ratio.
 *
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

  // This hack a symptom of a bad approach to the resizing problem.
  // We need to wait for the SVG element to actually change size in DOM.
  window.setTimeout(Lens.image.resizeAnnotations, 1);
};


/**
 * Remake the annotation borders based on the newly resized image.
 *
 * @return undefined
 */
Frame.prototype.resizeAnnotations = function() {
  var image = document.getElementById('annotate-img');

  var imageHeight = image.clientHeight || image.parentElement.clientHeight;
  var imageWidth = image.clientWidth || image.parentElement.clientWidth;

  // Now we re-write the annotations based on the adjusted size of the image
  Lens.annotations.forEach(function(annotation, index, set) {
    var x = annotation.x * imageWidth;
    var y = annotation.y * imageHeight;
    var width = annotation.width * imageWidth;
    var height = annotation.height * imageHeight;

    // Remove the old svg element
    var previousBox = annotation.boxElement;
    annotation.svgGroup.removeChild(previousBox);

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

    // Add the newly created svg shape element
    annotation.svgGroup.appendChild(annotation.boxElement);

    // Remove the label SVG Text element from the SVG Group.
    var previousLabel = annotation.svgGroup.querySelector('text');
    annotation.svgGroup.removeChild(previousLabel);

    // Add a new label, which will adjust dimensions automatically.
    annotation.addLabel.call(annotation);
  });
};
