/* globals AFRAME */

AFRAME.registerComponent("entity-collider-check", {
    schema: {
      intersected: { type: "boolean", default: false },
    },
  
    init: function () {
      this.onCollide = this.onCollide.bind(this);
      this.el.addEventListener("raycaster-intersected", this.onCollide);
    },
  
    onCollide: function (event) {
      this.data.intersected = true;
    },
  });