/* globals AFRAME  */

AFRAME.registerComponent("cursor-listener", {
  init: function () {
    this.dragging = false;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.el.addEventListener("mousedown", this.onMouseDown);
    this.el.addEventListener("mousemove ", this.onMouseMove);
    this.el.addEventListener("mouseup ", this.onMouseUp);
  },

  remove: function () {
    this.el.removeEventListener("mousedown", this.onMouseDown);
    this.el.removeEventListener("mousemove ", this.onMouseMove);
    this.el.removeEventListener("mouseup ", this.onMouseUp);
  },

  onMouseDown: function (e) {
    this.dragging = true;
  },

  onMouseMove: function (e) {
    if (this.dragging) {
      // Do something?
    }
  },

  onMouseUp: function (e) {
    this.dragging = false;
  },
});
