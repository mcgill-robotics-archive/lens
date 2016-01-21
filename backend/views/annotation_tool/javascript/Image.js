'use strict';
/**
 * Constructs the image object which is basically just a container for the image
 * and the annotation table.
 * @constructor
 * @author Malcolm Watt
 */
function Image () {
  this.container = document.getElementById('annotate-img');
  this.annotationTable = new AnnotationTable ();
  resolveImage();
  var that = this;

  /**
   * Requests the next frame from the database via XMLHttpRequest.
   * @author Malcolm Watt
   */
  function resolveImage() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', setBackgroundImage);
    req.open("GET", '/next', true); // Make an assynchronous request for the next frame
    req.send();
  };

  function setBackgroundImage() {
    var frameInfo = JSON.parse(this.responseText);
    LENS.frameId = frameInfo.id;
    that.setImage(LENS.frameId);
  };
}

Image.prototype.setImage = function(frameId) {
  var url = 'url(/image/' + frameId + ')';
  this.container.style.backgroundImage = url;
};
