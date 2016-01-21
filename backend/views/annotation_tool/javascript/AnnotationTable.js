'use strict';
/**
 * Will be both the source where we store the annotations for the image,
 * as well as the table which will be a visual queue for previously added labels.
 * @constructor
 * @author Malcolm Watt
 */
function AnnotationTable () {
  this.annotations = [];
  this.tags = [];
  this.table = document.getElementById('annotation-table');
}

AnnotationTable.prototype.validateAndAdd = function (annotation) {
  if (annotation.label) {
    this.annotations.push(annotation);
    this.tags.push(annotation.label);
  }
};

// Returns a set of label vertices objects.
AnnotationTable.prototype.stringify = function() {
  var information = {};
  information.annotations = this.annotations.map(function (annotation) {
    return annotation.getUsefullData();
  });
  information.tags = this.tags;
  information.image = LENS.frameId;
  return JSON.stringify(information);
};
