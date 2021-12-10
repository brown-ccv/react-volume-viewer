AFRAME.registerComponent("collider-check", {
  dependencies: ["raycaster", "buttons-check"],

  schema: {
    intersecting: { type: "boolean", default: false },
  },

  init: function () {
    this.onCollide = this.onCollide.bind(this);
    this.el.addEventListener("raycaster-intersection", this.onCollide);
  },

  onCollide: function (event) {
    this.data.intersecting = true;
  },
});
