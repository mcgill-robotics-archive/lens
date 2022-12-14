/**
 * @file Implements the main Annotation data structure for Lens.
 * @authors: Malcolm Watt, David Lougheed
 * @global: Frame, Lens
 */

'use strict';

/**
 * This object encapsulates all data and fuctionality relevant to the
 * annotation by the user.
 * @param {object} vertices : Describes the endpoints of the user's clicks.
 * @constructor
 */
function Annotation (vertices) {
  this.svgGroup = this.constructGroup(); // Creates an SVG group

  // The Px suffix denotes that the unit is pixels
  var leftXVertexPx = Math.min(vertices.startX, vertices.endX);
  var bottomYVertexPx = Math.min(vertices.startY, vertices.endY);
  var widthPx = Math.abs(vertices.endX - vertices.startX);
  var heightPx = Math.abs(vertices.endY - vertices.startY);

  // Handles the drawing of different shape types
  this.type = Lens.shapeType;
  switch (this.type) {
    case 'rectangle':
      this.boxElement = this.drawBox(leftXVertexPx, bottomYVertexPx, widthPx,
        heightPx);
      break;
    case 'ellipse':
    default:
      this.boxElement = this.drawEllipse(leftXVertexPx, bottomYVertexPx,
        widthPx, heightPx);
      break;
  }

  var img = Lens.image.container;

  var imageWidth = img.clientWidth || img.parentNode.clientWidth;
  var imageHeight = img.clientHeight || img.parentNode.clientHeight;

  // The values below are stored as decimals between 0 and 1 (easily conv. to %)
  this.x = leftXVertexPx / imageWidth;
  this.y = bottomYVertexPx / imageHeight;
  this.width = widthPx / imageWidth;
  this.height = heightPx / imageHeight;

  this.label = this.promptUserForLabel();
}


/**
 * Creates an SVG Group to store our SVG Elements (text for the tag and shape
 * for the actual visual delimiter) for this particular annotation.
 * @return {object} group : The DOM element for the SVG Group.
 * @classmethod
 */
Annotation.prototype.constructGroup = function() {
  var image = Lens.image.container;
  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'annotation-group');
  image.appendChild(group);
  return group;
};


/**
 * This function creates a text element with the current label and positions it
 * along side the actual shape that we have just created.
 * @return undefined
 */
Annotation.prototype.addLabel = function () {
  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  var font = 15;
  label.innerHTML = this.label;

  var leftVertexPx = this.x * Lens.image.container.clientWidth;
  var topVertexPx = this.y * Lens.image.container.clientHeight;

  var widthPx = this.width * Lens.image.container.clientWidth;
  var heightPx = this.height * Lens.image.container.clientHeight;

  var centerX = leftVertexPx + widthPx / 2;
  var centerY = topVertexPx + heightPx / 2;

  label.setAttribute('x', centerX);
  label.setAttribute('y', centerY);
  label.setAttribute('font-size', font);

  label.setAttribute('img-offsetx', centerX);
  label.setAttribute('img-offsety', centerY);

  // Add pop up functionality to the label
  var annotation = this;
  label.addEventListener('click', function (event) {
    Annotation.prototype.displayAnnotationInfo.call(annotation, event);
  });

  this.svgGroup.appendChild(label);
}


/**
 * Populates the info of the pop up based on the clicked annotation and makes
 * the pop up visible.
 * @param  {MouseEvent} event
 *         : The event object containing all relevant event data to click.
 * @return undefined
 */
Annotation.prototype.displayAnnotationInfo = function (event){
  var annotation = this;
  var overlay = document.getElementById("overlay");
  var popup = document.getElementById("annotation-detail-popup");

  Annotation.prototype.addInfoToPopup.call(this, popup);

  overlay.style.display = "block";
  popup.style.display = "block";
  event.stopPropagation();

  document.getElementById('delete-annotation').onclick = function () {
    Annotation.prototype.delete.call(annotation);
  };
}


/**
 * Use the grouped annotation data, and append this info into the popup div.
 * @return undefined
 */
Annotation.prototype.addInfoToPopup = function (popup) {
  var firstRow = popup.getElementsByClassName('attribute-names')[0];
  var secondRow = popup.getElementsByClassName('attribute-values')[0];

  var metadata = Annotation.prototype.getUsefullData.call(this);

  // For each property of metadata, add an entry to the popup
  for (var keys in metadata) {
  	if (metadata.hasOwnProperty(keys)) {
  	  var attributeName = document.createElement('th');
  	  attributeName.innerHTML = keys;
  	  attributeName.setAttribute('class', 'annotation-attribs');

      var value = metadata[keys];
      // Display numbers as percentages with one decimal of precision
      if (['x', 'y', 'height', 'width'].indexOf(keys) !== -1) {
        value = String(Math.round(Number(value) * 1000) / 10) + '%';
      }

      var attributeValue = document.createElement('td');
      attributeValue.innerHTML = value;
  	  attributeValue.setAttribute('class', 'annotation-vals');
  	  firstRow.appendChild(attributeName);
  	  secondRow.appendChild(attributeValue);
  	}
  }
};


/**
 * Uses the coordinates, width and height to draw containing region.
 * @param {Integer} x - The horizontal position of the leftmost line in px.
 * @param {Integer} y - The vertical position of the top line in px.
 * @param {Integer} width - The width of the box
 * @param {Integer} height - The height of the box
 * @return {object} svgBox : The HTML element for drawn box.
 */
Annotation.prototype.drawBox = function (x, y, width, height) {
  var group = this.svgGroup;
  var rectangle = document.createElementNS('http://www.w3.org/2000/svg',
    'rect');

  rectangle.setAttribute('class', 'annotation');
  rectangle.setAttribute('shape-type', this.type);
  rectangle.setAttribute('x', x);
  rectangle.setAttribute('y', y);
  rectangle.setAttribute('width', width);
  rectangle.setAttribute('height', height);
  rectangle.setAttribute('stroke-width', '3');
  rectangle.setAttribute('stroke', 'red');
  rectangle.setAttribute('fill-opacity', '0');

  rectangle.setAttribute('img-offsetx', x);
  rectangle.setAttribute('img-offsety', y);

  group.appendChild(rectangle);
  return rectangle;
}

/**
 * Uses the coordinates, width and height to draw a containing ellipse.
 * @return {object} ellipse : The SVG element for drawn ellipse.
 */
Annotation.prototype.drawEllipse = function(x, y, width, height) {
  var group = this.svgGroup;
  var ellipse = document.createElementNS('http://www.w3.org/2000/svg',
    'ellipse');

  ellipse.setAttribute('class', 'annotation');
  ellipse.setAttribute('shape-type', this.type);
  ellipse.setAttribute('cx', x + width / 2);
  ellipse.setAttribute('cy', y + height / 2);
  ellipse.setAttribute('rx', width / 2);
  ellipse.setAttribute('ry', height / 2);
  ellipse.setAttribute('stroke-width', '3');
  ellipse.setAttribute('stroke', 'red');
  ellipse.setAttribute('fill-opacity', '0');

  ellipse.setAttribute('img-offsetx', x);
  ellipse.setAttribute('img-offsety', y);

  group.appendChild(ellipse);
  return ellipse;
}

/**
 * Remove the current annotation from the page both from the ui, as well as
 * from the dataset that will be submitted to the backend.
 * @return undefined
 */
Annotation.prototype.delete = function() {
  // Remove svg group from DOM
  var g = this.svgGroup;
  g.parentElement.removeChild(g);

  // Remove object from annotations list
  for (var i = Lens.annotations.length - 1; i >= 0; i--) {
    if (Lens.annotations[i] === this) {
      Lens.annotations.splice(i, 1);
    }
  }

  // Call the close box function
  Lens.methods.closePopUp();
};

/**
 * Returns an object containing the important information for the database.
 * @return {Object} The current annotation's relevant information.
 */
Annotation.prototype.getUsefullData = function() {
  return {
    x : this.x,
    y : this.y,
    height : this.height,
    width : this.width,
    label : this.label,
    type : this.type
  };
};

/**
 * Requests that the user enter a label for the selected region.
 * @return {string} label : The user entered annotation.
 */
Annotation.prototype.promptUserForLabel = function(){
  var overlay = document.getElementById("overlay");
  var popup = document.getElementById("label-form-popup");
  overlay.style.display = "block";
  popup.style.display = "block";

  var that = this;
  // Add event listener and handler for the cancel button
  document.getElementById('cancel-annotation').onclick = function () {
    Lens.image.container.removeChild(that.svgGroup);
    overlay.style.display = "none";
    popup.style.display = "none";
  }

  // Add event listener and handler for the confirm button
  document.getElementById('confirm-annotation').onclick = function () {
    var selection = document.getElementById('annotation-selection');
    that.label = selection.options[selection.selectedIndex].value;
    Lens.annotations.push(that);
    that.addLabel();
    overlay.style.display = "none";
    popup.style.display = "none";
  }
};
