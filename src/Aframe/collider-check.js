AFRAME.registerComponent("collider-check", {
  dependencies: ["raycaster", "buttons-check"],

  schema: {
    intersecting: { type: "boolean", default: false },
  },

  init: function () {
    this.onCollide = this.onCollide.bind(this);
    this.el.addEventListener("raycaster-intersection", this.onCollide);
  },

  remove: function () {
    this.el.removeEventListener("raycaster-intersection", this.onCollide);
  },

  onCollide: function (e) {
    this.data.intersecting = true;
  },
});
