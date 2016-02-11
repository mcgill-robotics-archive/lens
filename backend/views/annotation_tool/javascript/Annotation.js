'use strict';
/**
 * Stores all data relevant to the annotation by the user.
 * @param {object} vertices : Describes the endpoints of the user's clicks.
 * @author Malcolm Watt
 * @constructor
 */
function Annotation (vertices) {
  // The Px suffix denotes that the unit is pixels
  let leftXVertexPx = Math.min(vertices.startX, vertices.endX);
  let bottomYVertexPx = Math.min(vertices.startY, vertices.endY);
  let widthPx = Math.abs(vertices.endX - vertices.startX);
  let heightPx = Math.abs(vertices.endY - vertices.startY);
 
  this.boxElement = this.drawBox(leftXVertexPx, bottomYVertexPx, widthPx, 
          heightPx);
  
  let img = Lens.image.container;
 
  this.x = leftXVertexPx / img.clientWidth;
  this.y = bottomYVertexPx / img.clientHeight;
  this.width = widthPx / img.clientWidth;
  this.height = heightPx / img.clientHeight;

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
Annotation.prototype.drawBox = function (x, y, width, height) {
  var image = Lens.image.container;
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

  image.appendChild(rectangle);
  return rectangle;
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
