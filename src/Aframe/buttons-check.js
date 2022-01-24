/* globals AFRAME  */

// TODO: Change vars to triggerDown and gripDown
AFRAME.registerComponent("buttons-check", {
  schema: {
    clipPlane: { type: "boolean", default: false },
    grabObject: { type: "boolean", default: false },
  },

  init: function () {
    this.el.addEventListener("gripdown", this.onGripDown);
    this.el.addEventListener("gripup", this.onGripUp);
    this.el.addEventListener("triggerdown", this.onTriggerDown);
    this.el.addEventListener("triggerup", this.onTriggerUp);
    this.onGripDown = this.onGripDown.bind(this);
    this.onGripUp = this.onGripDown.bind(this);
    this.onTriggerDown = this.onTriggerDown.bind(this);
    this.onTriggerUp = this.onTriggerUp.bind(this);
  },

  remove: function () {
    this.el.removeEventListener("gripdown", this.onGripDown);
    this.el.removeEventListener("gripup", this.onGripUp);
    this.el.removeEventListener("triggerdown", this.onTriggerDown);
    this.el.removeEventListener("triggerup", this.onTriggerUp);
  },

  onGripDown: function (e) {
    this.data.clipPlane = true;
  },
  onGripUp: function (e) {
    this.data.clipPlane = false;
  },
  onTriggerDown: function (e) {
    this.data.grabObject = true;
  },
  onTriggerUp: function (e) {
    this.data.grabObject = false;
  },
});
