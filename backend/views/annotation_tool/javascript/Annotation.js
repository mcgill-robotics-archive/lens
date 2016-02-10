'use strict';
/**
 * Stores all data relevant to the annotation by the user.
 * @param {object} vertices : Describes the endpoints of the user's clicks.
 * @author Malcolm Watt
 * @constructor
 */
function Annotation (vertices) {
  this.x = Math.min(vertices.startX, vertices.endX);
  this.y = Math.min(vertices.startY, vertices.endY);
  this.width = Math.abs(vertices.endX - vertices.startX);
  this.height = Math.abs(vertices.endY - vertices.startY);
  this.boxElement = this.drawBox();
  this.label = this.promptUserForLabel();
  this.type = 'rectangle'; // This needs to be sourced from a multiple select
  if (!this.label) {
    Lens.image.container.removeChild(this.boxElement);
  }
}

/**
 * Uses the coordinates, width and height to draw containing region.
 * @author Malcolm Watt
 * @return {object} svgBox : The HTML element for drawn box.
 */
Annotation.prototype.drawBox = function () {
  var image = Lens.image.container;
  var rectangle = document.createElementNS('http://www.w3.org/2000/svg',
    'rect');

  rectangle.setAttribute('class', 'annotation');
  rectangle.setAttribute('shape-type', this.type);
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
 * Uses the coordinates, width and height to draw a containing circle.
 * @author David Lougheed
 * @return {object} circle : The SVG element for drawn box.
 */
Annotation.prototype.drawCircle = function() {
  var image = Lens.image.container;
  var ellipse = document.createElementNS('http://www.w3.org/2000/svg',
    'ellipse');

  ellipse.setAttribute('class', 'annotation');
  ellipse.setAttribute('shape-type', this.type);
  ellipse.setAttribute('cx', this.x + this.width / 2);
  ellipse.setAttribute('cy', this.y + this.height / 2);
  ellipse.setAttribute('rx', this.width / 2);
  ellipse.setAttribute('ry', this.height / 2);
  ellipse.setAttribute('stroke-width', '3');
  ellipse.setAttribute('stroke', 'red');
  ellipse.setAttribute('fill-opacity', '0');

  ellipse.setAttribute('img-offsetx', this.x);
  ellipse.setAttribute('img-offsety', this.y);

  image.appendChild(ellipse);
  return circle;
}

/**
 * This is in the works. It is planned to append all of my labels
 * to the input table, this would allow me to remove them.
 * @param  {[type]} first_argument [description]
 * @return {[type]}                [description]
 */
Annotation.prototype.removeBox = function() {
  // body...
};

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
 * @author  Malcolm Watt
 * @return {string} label : The user entered annotation.
 */
Annotation.prototype.promptUserForLabel = function(){
  return prompt('Label:');
};
