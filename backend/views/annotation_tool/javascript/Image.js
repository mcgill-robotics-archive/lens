'use strict';
/**
 * Constructs the image object which is basically just a container for the image
 * and the annotation table.
 * @constructor
 * @author Malcolm Watt
 */
function Image () {
  this.container = document.getElementById('annotate-img');
  this.annotationTable = new AnnotationTable ();
}
