// TODO: I don't think we need this at all

AFRAME.registerComponent("buttons-check", {
  init: function () {
    this.clipPlane = false;

    this.setClipPlane = this.setClipPlane.bind(this);
    this.stopClipPlane = this.stopClipPlane.bind(this);
    this.el.addEventListener("gripdown", (e) => this.setClipPlane(e));
    this.el.addEventListener("gripup", (e) => this.stopClipPlane(e));
    this.el.addEventListener("triggerdown", (e) => this.setClipPlane(e));
    this.el.addEventListener("triggerup", (e) => this.stopClipPlane(e));
  },

  remove: function () {
    this.el.removeEventListener("gripdown", (e) => this.setClipPlane(e));
    this.el.removeEventListener("gripup", (e) => this.stopClipPlane(e));
    this.el.removeEventListener("triggerdown", (e) => this.setClipPlane(e));
    this.el.removeEventListener("triggerup", (e) => this.stopClipPlane(e));
  },

  setClipPlane: function (e) {
    this.clipPlane = true;
  },
  stopClipPlane: function (e) {
    this.clipPlane = false;
  },
});
