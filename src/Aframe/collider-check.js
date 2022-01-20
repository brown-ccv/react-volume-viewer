/* globals AFRAME */

AFRAME.registerComponent("collider-check", {
  dependencies: ["raycaster", "buttons-check"],

  schema: {
    intersecting: { type: "boolean", default: false },
  },

  init: function () {
    this.el.addEventListener("raycaster-intersection", this.onCollide);
    this.onCollide = this.onCollide.bind(this);
  },

  onCollide: function (e) {
    this.data.intersecting = true;
  },

  remove: function () {
    this.el.removeEventListener("raycaster-intersection", this.onCollide);
  },
});
