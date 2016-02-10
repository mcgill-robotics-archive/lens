'use strict';
/**
 * Will be both the source where the annotations are stored for the image,
 * and the table which will be a visual queue for previously added labels.
 * @author Malcolm Watt
 * @constructor
 */
function AnnotationTable () {
  this.annotations = [];
  this.table = document.getElementById('annotation-table');
}

/**
 * Checks that the label is not empty and adds to the table accordingly.
 * @author Malcolm Watt
 * @param  {Annotation} annotation : The newly created annotation object.
 */
AnnotationTable.prototype.validateAndAdd = function (annotation) {
  if (annotation.label) {
    this.annotations.push(annotation);
    Lens.tags.push(annotation.label);
  }
};

// Returns a set of label vertices objects.
/**
 * Stringifies the usefull information from the object hierarchy.
 * @author Malcolm Watt
 * @return {string} Stringified object containing the annotations.
 */
AnnotationTable.prototype.stringify = function() {
  return JSON.stringify(this.annotations.map(function (annotation) {
    return annotation.getUsefullData();
  }));
};
