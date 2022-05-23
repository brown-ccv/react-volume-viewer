import AFRAME from "aframe";

AFRAME.registerComponent("entity-collider-check", {
  schema: {
    intersected: { type: "boolean", default: false },
  },

  init: function () {
    this.onCollide = this.onCollide.bind(this);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
  },

  remove: function () {
    this.el.removeEventListener("raycaster-intersected", this.onCollide);
  },

  onCollide: function (e) {
    this.data.intersected = true;
  },
});
