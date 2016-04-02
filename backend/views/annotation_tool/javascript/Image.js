'use strict';
/**
 * Constructs the image object which is basically
 * just a container for the image
 * and the annotation table.
 * @author Malcolm Watt
 * @constructor
 */
function Image () {
  this.container = document.getElementById('annotate-img');
  this.fitToPage();
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
    var url = 'url(/image/' + Lens.frameId + ')';
    Lens.image.container.style.backgroundImage = url;
  };
}

Image.prototype.fitToPage = function() {
  var image = document.getElementById('annotate-img');
  image.style.backgroundSize = 'cover';
  image.style.width = "100%";
  image.style.height = "100%";
};
