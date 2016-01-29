'use strict';

var image, imageElem;
/**
 * LENS Global stores all data & functionality related to LENS appart from
 * constructors and class methods.
 * @author Malcolm Watt
 */
var LENS = {
  page : null, // Gets initialized by the body elements onload event handler
  frameId : null,
  tags : [],
  methods : {
    /**
     * Initialize the page property and add all required event listeners.
     * @author Malcolm Watt
     * @return undefined
     */
    init : function () {
      LENS.page = new Page();
      LENS.methods.initializeImageListeners();
    },

    /**
     * Submit the annotations from the annotation table to the backend.
     * @author Malcolm Watt
     * @param  {boolean} interesting :
     * If the `Not Interesting` button is pressed then this is true.
     */
    submit : function (interesting) {
      var req = new XMLHttpRequest();
      req.open('POST', '/lens/', true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(LENS.methods.formatData(interesting));
      location.reload(true); // true forces it to not reload from cache
    },

    /**
     * Gets the annotations and tags to the backend.
     * @author Malcolm Watt
     * @param  {boolean} interesting :
     * If the `Not Interesting` button is pressed then this is true.
     * return {string} The data from the annotations.
     */
    formatData : function (interesting) {
      var description = {};
      description.frame = LENS.frameId;
      description.interesting = interesting;
      description.tags = LENS.tags; 
      // general. This is a placeholder for when this is implemented.
      description.annotations = JSON.parse(
              LENS.page.image.annotationTable.stringify()
      );
      console.log(description);
      return JSON.stringify(description);
    },

    /**
     * Initialize the event listeners relevant to the selection of regions on
     * the image.
     * @author Malcolm Watt
     * @return undefined
     */
    initializeImageListeners : function () {
      // The HTML element that contains the image to be annotated
      var image = LENS.page.image.container;
      image.addEventListener('mousedown', LENS.methods.imageDownClickListener);
    },

    /**
     * Sets the starting point (x and y) of the LENS object when the
     * image is clicked.
     * @author Malcolm Watt
     * @param  {MouseEvent} event
     *        : The event object containing all relevant event data.
     * @return undefined
     */
    imageDownClickListener : function (event) {
      // Check for an offset on the element that triggered the event
      var triggerElement = event.target;

      var imageOffsetX = triggerElement.getAttribute('img-offsetx');
      var elementOffsetX = parseFloat(imageOffsetX) || 0;

      var imageOffsetY = triggerElement.getAttribute('img-offsety');
      var elementOffsetY = parseFloat(imageOffsetY) || 0;

      /*
       * event.offsetX and event.offsetY are new to the MDN spec, and because
       * of this they behave differently in different browsers: Chrome and
       * Mozilla, the same event.target, and the same event.currentTarget, yet
       * event.offsetX for Chrome is relative to the currentTarget, whereas
       * on Mozilla it is relative to the target.
       *
       * Since I did not see a clear cut alternative to the offset property,
       * I do some loose browser detection. I have made the assumption that
       * all browsers except chrome behave like Mozilla when it comes to
       * event.offset propeties. This is most likely false, and will change
       * as different (less popular) browsers are tested.
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


      /**
       * Handles the release of the click.
       * @author Malcolm Watt
       * @param  {Event} _event : The Event object
       */
      function imageReleaseClickListener (_event) {
        // Check for an offset on the element that triggered the event
        var _triggerElement = _event.target;

        var _imageOffsetX = _triggerElement.getAttribute('img-offsetx');
        var _elementOffsetX = parseFloat(_imageOffsetX) || 0;

        var _imageOffsetY = _triggerElement.getAttribute('img-offsety');
        var _elementOffsetY = parseFloat(_imageOffsetY) || 0;

        // See above block comment on event.offset
        var endX, endY;
        if (!!window.chrome) {
          endX = _event.offsetX;
          endY = _event.offsetY;
        } else {
          endX = _event.offsetX + _elementOffsetX;
          endY = _event.offsetY + _elementOffsetY;
        }

        var annotation = new Annotation({
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY
        });

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
