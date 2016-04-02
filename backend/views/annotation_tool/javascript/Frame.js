'use strict';
/**
 * Constructs the image object which is basically
 * just a container for the image
 * and the annotation table.
 * @author Malcolm Watt
 * @constructor
 */
function Frame () {
  this.container = document.getElementById('annotate-img');
  this.aspectRatio;
  resolveImage();

  /**
   * Requests the next frame from the database via XMLHttpRequest.
   * @author Malcolm Watt
   */
  function resolveImage() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', setBackgroundImage);
    // Make an assynchronous request for the next frame
    req.open("GET", '/next', true);
    req.send();
  };

  /**
   * Sets the `background-img` property of the main SVG tag.
   * @author Malcolm Watt
   */
  function setBackgroundImage() {
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
}

Frame.prototype.fitToPage = function() {
  var image = document.getElementById('annotate-img');
  image.style.backgroundSize = 'cover';

  image.style.width = "100%";

  var pageHeight = Number(window.innerHeight);
  // We need to consider the height of the help text
  var helpHeight = Number(document.getElementById('help').clientHeight);
  var desiredHeight = pageHeight - helpHeight;
  image.style.height = desiredHeight + "px";

  // Now we need to check the aspect ratio and adjust accordingly
  var aspectRatio = image.clientWidth / image.clientHeight;

  if (aspectRatio > Lens.image.aspectRatio) {
    // Limiting factor is height
    var adjustedWidth = image.clientHeight * Lens.image.aspectRatio;
    var adjustedWidthPercentage = adjustedWidth / image.clientWidth;
    image.style.width = adjustedWidthPercentage * 100 + '%';
  } else {
    // Limiting factor is width
    var adjustedHeight = image.clientWidth / Lens.image.aspectRatio;
    image.style.height = adjustedHeight + 'px';
  }
};
