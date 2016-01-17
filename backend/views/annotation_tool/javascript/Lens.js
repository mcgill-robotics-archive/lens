'use strict';

var image, imageElem;
/**
 * LENS Global stores all data & functionality related to LENS appart from constructors and class methods.
 * @type {Object}
 * @author Malcolm Watt
 */
var LENS = {
  page : null, // Gets initialized by the body elements onload event handler
  frameId : null,
  methods : {
    /**
     * Initialize the page property and add all required event listeners.
     * @return undefined
     */
    init : function () {
      LENS.page = new Page();
      LENS.methods.getBackgroundImageId();
      LENS.methods.initializeImageListeners();
    },

    getBackgroundImageId : function () {
      var req = new XMLHttpRequest();
      req.addEventListener('load', LENS.methods.getBackgroundImage);
      req.open("GET", '/next');
      req.send();
    },

    getBackgroundImage : function () {
      var frameInfo = JSON.parse(this.responseText);
      LENS.frameId = frameInfo.id;
      var req = new XMLHttpRequest();
      req.addEventListener('load', LENS.methods.setBackgroundImage);
      req.open("GET", '/image/' + LENS.frameId);
      req.send();
    },

    setBackgroundImage : function () {
      image = this.responseText;
      imageElem = document.querySelector("#annotate-img");
      debugger;
    },

    /**
     * Initialize the event listeners relevant to the selection of regions on the image.
     * @return undefined
     */
    initializeImageListeners : function () {
      var image = LENS.page.image.container; // The HTML element that contains the image to be annotated

      // The above todo will avoid the need of having the vertices as globally stored properties.
      image.addEventListener('mousedown', LENS.methods.imageDownClickListener);
    },

    /**
     * Sets the starting point (x and y) of the LENS object when the image is clicked.
     * @param  {MouseEvent} event : The event object containing all relevant event data.
     * @return undefined
     */
    imageDownClickListener : function (event) {
      // Check for an offset on the element that triggered the event
      var triggerElement = event.target;

      var elementOffsetX = parseFloat(triggerElement.getAttribute('img-offsetx')) || 0;
      var elementOffsetY = parseFloat(triggerElement.getAttribute('img-offsety')) || 0;

      var startX = event.offsetX + elementOffsetX;
      var startY = event.offsetY + elementOffsetY;

      var image = LENS.page.image.container;

      image.addEventListener('mouseup', imageReleaseClickListener);
      document.addEventListener('mouseup', removeClickReleaseListeners);


      function imageReleaseClickListener (_event) {
        // Check for an offset on the element that triggered the event
        var _triggerElement = _event.target;
        var _elementOffsetX = parseFloat(_triggerElement.getAttribute('img-offsetx')) || 0;
        var _elementOffsetY = parseFloat(_triggerElement.getAttribute('img-offsety')) || 0;

        var endX = _event.offsetX + _elementOffsetX;
        var endY = _event.offsetY + _elementOffsetY;

        var annotation = new Annotation({startX: startX, startY: startY, endX: endX, endY: endY});

        var annotationTable = LENS.page.image.annotationTable;
        annotationTable.validateAndAdd(annotation);

        removeClickReleaseListeners();
      }

      function removeClickReleaseListeners() {
        var image = LENS.page.image.container;
        image.removeEventListener('mouseup', imageReleaseClickListener);
        document.removeEventListener('mouseup', removeClickReleaseListeners);
      }
    }
  }
};
