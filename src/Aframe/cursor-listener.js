/* globals AFRAME  */

AFRAME.registerComponent("cursor-listener", {
  init: function () {
    this.dragging = false;

    this.el.addEventListener("mousedown", this.onMousedown);
    this.el.addEventListener("mousemove ", this.onMouseMove);
    this.el.addEventListener("mouseup ", this.onMouseUp);
    this.onMousedown = this.onMousedown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  },

  remove: function () {
    this.el.removeEventListener("mousedown", this.onMouseDown);
    this.el.removeEventListener("mousemove ", this.onMouseMove);
    this.el.removeEventListener("mouseup ", this.onMouseUp);
  },

  onMouseDown: function (evt) {
    this.dragging = true;
  },

  onMouseMove: function (evt) {
    if (this.dragging) {
      // Do something?
    }
  },

  onMouseUp: function (evt) {
    this.dragging = false;
  },
});
