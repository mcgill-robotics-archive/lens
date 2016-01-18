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
      LENS.methods.initializeImageListeners();
    },

    submit : function (interesting) {
      var req = new XMLHttpRequest();
      req.open('POST', '/lens/', true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(LENS.methods.formatData(interesting)); 
      location.reload(true); // true forces it to not reload from cache
    },

    formatData : function (interesting) {
      var description = {};
      description.frame = LENS.frameId;
      description.interesting = interesting;
      // description.tags = LENS.tags; We need a way to annotate the image in general. This is a placeholder for when this is implemented. 
      description.annotations = JSON.parse(
              LENS.page.image.annotationTable.stringify()
      );
      console.log(description);
      return JSON.stringify(description);
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

      /*
       * event.offsetX and event.offsetY are new to the MDN spec, and because of this they
       * behave differently in different browsers: Chrome and Mozilla, the same event.target,
       * and the same event.currentTarget, yet event.offsetX for Chrome is relative to the
       * currentTarget, whereas on Mozilla it is relative to the target.
       *
       * Since I did not see a clear cut alternative to the offset property, I do some loose
       * browser detection. I have made the assumption that all browsers except chrome behave
       * like Mozilla when it comes to event.offset propeties. This is most likely false, and
       * I will change it as I test different (less popular) browsers.
       */
      var startX, startY;
      if (!!window.chrome) {
        startX = event.offsetX;
        startY = event.offsetY;
      } else {
        startX = event.offsetX + elementOffsetX;
        startY = event.offsetY + elementOffsetY;
      }

      var image = LENS.page.image.container;

      image.addEventListener('mouseup', imageReleaseClickListener);
      document.addEventListener('mouseup', removeClickReleaseListeners);


      function imageReleaseClickListener (_event) {
        // Check for an offset on the element that triggered the event
        var _triggerElement = _event.target;
        var _elementOffsetX = parseFloat(_triggerElement.getAttribute('img-offsetx')) || 0;
        var _elementOffsetY = parseFloat(_triggerElement.getAttribute('img-offsety')) || 0;

        // See above block comment on event.offset
        var endX, endY;
        if (!!window.chrome) {
          endX = _event.offsetX;
          endY = _event.offsetY;
        } else {
          endX = _event.offsetX + _elementOffsetX;
          endY = _event.offsetY + _elementOffsetY;
        }

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
