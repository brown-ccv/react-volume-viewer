/* globals AFRAME */

AFRAME.registerComponent("entity-collider-check", {
  schema: {
    intersected: { type: "boolean", default: false },
  },

  init: function () {
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.onCollide = this.onCollide.bind(this);
  },

  remove: function() {
    this.el.removeEventListener("raycaster-intersected", this.onCollide);
  },

  onCollide: function (e) {
    this.data.intersected = true;
  },
});
