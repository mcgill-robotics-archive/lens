'use strict';
/**
 * Stores all data relevant to the annotation by the user.
 * @param {object} vertices : Describes the endpoints of the user's clicks.
 * @author Malcolm Watt
 * @constructor
 */
function Annotation (vertices) {
  this.svgGroup = this.constructGroup();
  this.x = Math.min(vertices.startX, vertices.endX);
  this.y = Math.min(vertices.startY, vertices.endY);
  this.width = Math.abs(vertices.endX - vertices.startX);
  this.height = Math.abs(vertices.endY - vertices.startY);
  this.boxElement = this.drawBox();
  this.label = this.promptUserForLabel();
  this.type = 'rect'; // This needs to be sourced from a multiple select
  if (this.label) {
    this.addLabel();
  } else {
    Lens.image.container.removeChild(this.svgGroup);
  }
}

/**
 * Creates an SVG Group to store our SVG Elements (text for the tag and shape
 * for the actual visual delimiter) for this particular annotation.
 * @author Malcolm Watt
 * @return {object} group : The DOM element for the SVG Group.
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
 * @author Malcolm Watt
 */
Annotation.prototype.addLabel = function () {
  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  var font = 15;
  label.innerHTML = this.label;
  label.setAttribute('x', this.x + 7);
  label.setAttribute('y', this.y + font);
  label.setAttribute('font-size', font);
  
  label.setAttribute('img-offsetx', this.x + 3);
  label.setAttribute('img-offsety', this.y + font);

  var annotation = this;
  label.addEventListener('click', function (event) {
  	Annotation.prototype.displayAnnotationInfo.call(annotation, event);
  });
  this.svgGroup.appendChild(label);
}

Annotation.prototype.displayAnnotationInfo = function (event){
  var annotation = this;
  var overlay = document.getElementById("overlay");
  var popup = document.getElementById("popup");
  
  Annotation.prototype.addInfoToPopup(popup, annotation);

  overlay.style.display = "block";
  popup.style.display = "block";
  event.stopPropagation();
}

/**
 * Use the grouped annotation data, and append this info into the popup div.
 * @author Malcolm Watt
 * @return undefined
 */
Annotation.prototype.addInfoToPopup = function (popup, annotation) {
  var firstRow = popup.getElementsByClassName('attribute-names')[0];
  var secondRow = popup.getElementsByClassName('attribute-values')[0];

  var metadata = Annotation.prototype.getUsefullData.call(annotation);

  for (var keys in metadata) {
  	if (metadata.hasOwnProperty(keys)) {
  	  var attributeName = document.createElement('th');
  	  attributeName.innerHTML = keys;
  	  attributeName.setAttribute('class', 'annotation-attribs');
  	  var attributeValue = document.createElement('td');
  	  attributeValue.innerHTML = metadata[keys];
  	  attributeValue.setAttribute('class', 'annotation-vals');
  	  firstRow.appendChild(attributeName);
  	  secondRow.appendChild(attributeValue);
  	}
  }
};

/**
 * Uses the coordinates, width and height to draw containing region.
 * @author Malcolm Watt
 * @return {object} svgBox : The HTML element for drawn box.
 */
Annotation.prototype.drawBox = function () {
  var rect = document.createElementNS('http://www.w3.org/2000/svg',
    'rect');

  rect.setAttribute('class', 'annotation');
  rect.setAttribute('shape-type', this.type);
  rect.setAttribute('x', this.x);
  rect.setAttribute('y', this.y);
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);
  rect.setAttribute('stroke-width', '3');
  rect.setAttribute('stroke', 'red');
  rect.setAttribute('fill-opacity', '0');

  rect.setAttribute('img-offsetx', this.x);
  rect.setAttribute('img-offsety', this.y);

  this.svgGroup.appendChild(rect);
  return rect;
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
