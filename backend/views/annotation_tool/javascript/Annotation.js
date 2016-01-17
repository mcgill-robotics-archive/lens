'use strict';
/**
 * Stores all data relevant to the annotation by the user.
 * @param {object} vertices : Describes the endpoints of the user's clicks.
 * @constructor
 * @author Malcolm Watt
 */
function Annotation (vertices) {
  this.x = Math.min(vertices.startX, vertices.endX);
  this.y = Math.min(vertices.startY, vertices.endY);
  this.width = Math.abs(vertices.endX - vertices.startX);
  this.height = Math.abs(vertices.endY - vertices.startY);
  this.boxElement = this.drawBox();
  this.label = this.promptUserForLabel();
  if (!this.label) {
    LENS.page.image.container.removeChild(this.boxElement);
  }
}

/**
 * Uses the coordinates, width and height to draw containing region.
 * @return {object} svgBox : The HTML element for drawn box.
 */
Annotation.prototype.drawBox = function () {
  var image = LENS.page.image.container;
  var rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  rectangle.setAttribute('x', this.x);
  rectangle.setAttribute('y', this.y);
  rectangle.setAttribute('width', this.width);
  rectangle.setAttribute('height', this.height);
  rectangle.setAttribute('stroke-width', '3');
  rectangle.setAttribute('stroke', 'red');
  rectangle.setAttribute('fill-opacity', '0');

  rectangle.setAttribute('img-offsetx', this.x);
  rectangle.setAttribute('img-offsety', this.y);

  image.appendChild(rectangle);
  return rectangle;
}

/**
 * This is in the works. It is planned to append all of my labels
 * to the input table, this would allow me to remove them.
 * @param  {[type]} first_argument [description]
 * @return {[type]}                [description]
 */
Annotation.prototype.removeBox = function(first_argument) {
  // body...
};

Annotation.prototype.getUsefullData = function(first_argument) {
  return {
    x : this.x,
    y : this.y,
    height : this.height,
    width : this.width,
    label : this.label
  };
};

/**
 * Requests that the user enter a label for the selected region.
 * @return {string} label : The user entered annotation.
 */
Annotation.prototype.promptUserForLabel = function(){
  return prompt('Label:');
};
