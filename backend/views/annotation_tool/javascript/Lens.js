'use strict';
/**
 * Lens Global stores all data & functionality related to Lens appart from
 * constructors and class methods.
 * @author Malcolm Watt
 */
var Lens = {
  issueUrl : "https://github.com/mcgill-robotics/lens/issues/new",
  image: null,
  frameId: null,
  annotations: [],
  user: null,
  methods : {},
  shapeType : 'rectangle'
};


/**
 * Initialize the page property and add all required event listeners.
 * @author Malcolm Watt
 * @return undefined
 */
Lens.methods.init = function() {
  Lens.image = new Frame();
  Lens.methods.initializeImageListeners();
  Lens.methods.initOverlayListener();
  window.onresize = Lens.image.fitToPage; // Add resize listener
},



/**
 * Submit the annotations from the annotation table to the backend.
 * @author Malcolm Watt
 * @param  {boolean} interesting :
 * If the `Not Interesting` button is pressed then this is true.
 */
Lens.methods.submit = function(interesting) {
  var req = new XMLHttpRequest();
  req.open('POST', '/annotate/' + Lens.frameId, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(Lens.methods.formatData(interesting));
  Lens.methods.reload();
},

/**
 * Reset globals and get new frame from database.
 * @author Malcolm Watt
 * @return undefined
 */
Lens.methods.reload = function() {
  Lens.frameId = null;
  Lens.image = new Frame();
  var annotations = document.getElementsByClassName('annotation-group');
  for (var i = annotations.length - 1; i >= 0; i--) {
    annotations[i].remove();
  }
  Lens.annotations = [];
},

/**
 * Gets the annotations and tags to the backend.
 * @author Malcolm Watt
 * @param  {boolean} interesting :
 * If the `Not Interesting` button is pressed then this is true.
 * return {string} The data from the annotations.
 */
Lens.methods.formatData = function(interesting) {
  var description = {};
  description.interesting = interesting;

  description.tags = [];
  description.annotations = [];
  Lens.annotations.forEach(function (element, index) {
    description.annotations.push(element.getUsefullData());
    description.tags.push(element.label);
  });

  console.log(description);
  return JSON.stringify(description);
},

/**
 * Initialize the event listeners relevant to the selection of regions on
 * the image.
 * @author Malcolm Watt
 * @return undefined
 */
Lens.methods.initializeImageListeners = function() {
  // The HTML element that contains the image to be annotated
  var image = Lens.image.container;
  image.addEventListener('mousedown', Lens.methods.imageDownClickListener);
},

/**
 * Add the close button listener to the pop up element.
 * @author Malcolm Watt
 * @return undefined
 */
Lens.methods.initOverlayListener = function() {
  document.getElementById("close-button").onclick = Lens.methods.closePopUp;
},

/**
 * Removes all columns except the defaults from the table in the pop up,
 * then sets the display to none, rendering the pop up invisible.
 * @author Malcolm Watt
 * @return undefined
 */
Lens.methods.closePopUp = function() {
  var overlay = document.getElementById("overlay");
  var popup = document.getElementById("popup");

  var firstRow = popup.getElementsByClassName('attribute-names')[0];
  var secondRow = popup.getElementsByClassName('attribute-values')[0];

  // Remove the columns in the first row
  var attributeNames = firstRow.getElementsByClassName(
    'annotation-attribs');
  for (var i = attributeNames.length - 1; i >= 0; i--) {
    firstRow.removeChild(attributeNames[i]);
  }

  var attributeValues = secondRow.getElementsByClassName(
    'annotation-vals');

  // Remove the columns in the second row
  for (var j = attributeValues.length - 1; j >= 0; j--) {
    secondRow.removeChild(attributeValues[j]);
  }

  overlay.style.display = "none";
  popup.style.display = "none";
},


/**
 * Sets the starting point (x and y) of the Lens object when the
 * image is clicked.
 * @author Malcolm Watt
 * @param  {MouseEvent} event
 *        : The event object containing all relevant event data.
 * @return undefined
 */
Lens.methods.imageDownClickListener = function(event) {
  // Prevent text selection and other unwanted dragging side effects
  event.preventDefault();

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

  var image = Lens.image.container;
  var body = document.querySelector('body');

  // Cache image position
  var imageLeft = image.offsetLeft;
  var imageTop = image.offsetTop;

  image.addEventListener('mousemove', imageMouseMoveListener);

  // Append a temporary element for displaying drag shape as mouse moves
  var dragShape = document.createElement('div');
  dragShape.setAttribute('id', 'dragShape');
  dragShape.setAttribute('class', Lens.shapeType);
  body.appendChild(dragShape);

  image.addEventListener('mouseup', imageReleaseClickListener);
  document.addEventListener('mouseup', missedReleaseClickListener);
  image.addEventListener('mousedown', removeClickReleaseListeners);

  /**
   * Handles drawing of perimeter during mouse movement.
   * @author David Lougheed
   * @param {Event} _event : The Event object
   * @return undefined
   */
  function imageMouseMoveListener(_event) {
    // See above block comment on event.offset
    var currentX, currentY;
    if (!!window.chrome) {
      currentX = _event.offsetX;
      currentY = _event.offsetY;
    } else {
      currentX = _event.offsetX + elementOffsetX;
      currentY = _event.offsetY + elementOffsetY;
    }

    // Adjust drag shape's width, height, and position to match mouse pos.
    dragShape.style.width = Math.abs(currentX - startX).toString() + 'px';
    dragShape.style.left = (startX + imageLeft).toString() + 'px';
    if (currentX < startX) {
      dragShape.style.left = (currentX + imageLeft).toString() + 'px';
    }

    dragShape.style.height = Math.abs(currentY - startY).toString() + 'px';
    dragShape.style.top = (startY + imageTop).toString() + 'px';
    if (currentY < startY) {
      dragShape.style.top = (currentY + imageTop).toString() + 'px';
    }
  }

  /**
   * Handles the release of the click.
   * @author Malcolm Watt
   * @param  {Event} _event : The Event object
   */
  function imageReleaseClickListener(_event) {
    _event.stopPropagation();

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

    // Remove the temporary drag shape
    body.removeChild(dragShape);

    // Handle if someone dragged in reverse
    if (endX < startX) {
      var tmp = endX;
      endX = startX;
      startX = tmp;
    }
    if (endY < startY) {
      var tmp = endY;
      endY = startY;
      startY = tmp;
    }

    if (endX - startX > 5 || endY - startY > 5) {
      var annotation = new Annotation({
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY
      });

      if (annotation.label) {
        Lens.annotations.push(annotation);
      }
    }

    removeClickReleaseListeners();
  }

  function removeClickReleaseListeners() {
    var image = Lens.image.container;
    image.removeEventListener('mouseup', imageReleaseClickListener);
    document.removeEventListener('mouseup', removeClickReleaseListeners);
    document.removeEventListener('mouseup', missedReleaseClickListener);

    image.removeEventListener('mousemove', imageMouseMoveListener);
  }

  /**
   * Handles a 'missed' click on the document outside of the image.
   * @author David Lougheed
   * @return undefined
   */
  function missedReleaseClickListener() {
    body.removeChild(dragShape);
    removeClickReleaseListeners();
  }
},

Lens.methods.setShapeType = function(newType) {
  Lens.shapeType = newType;
}
