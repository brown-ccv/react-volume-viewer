// TODO: I don't think we need this at all

AFRAME.registerComponent("buttons-check", {
  schema: {
    clipPlane: { type: "boolean", default: false },
    grabObject: { type: "boolean", default: false },
  },

  init: function () {
    this.setClipPlane = this.setClipPlane.bind(this);
    this.el.addEventListener("gripdown", (e) => this.setClipPlane(e, true));
    this.el.addEventListener("gripup", (e) => this.setClipPlane(e, false));
    this.el.addEventListener("triggerdown", (e) => this.setClipPlane(e, true));
    this.el.addEventListener("triggerup", (e) => this.setClipPlane(e, false));
  },

  remove: function () {
    this.el.removeEventListener("gripdown", (e) => this.setClipPlane(e, true));
    this.el.removeEventListener("gripup", (e) => this.setClipPlane(e, false));
    this.el.removeEventListener("triggerdown", (e) =>
      this.setClipPlane(e, true)
    );
    this.el.removeEventListener("triggerup", (e) =>
      this.setClipPlane(e, false)
    );
  },

  setClipPlane: function (e, bool) {
    this.data.clipPlane = bool;
  },
});
