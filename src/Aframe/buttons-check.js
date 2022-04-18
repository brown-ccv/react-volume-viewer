import AFRAME from "aframe";

AFRAME.registerComponent("buttons-check", {
  schema: {
    gripDown: { type: "boolean", default: false },
    triggerDown: { type: "boolean", default: false },
  },

  init: function () {
    this.onGripDown = this.onGripDown.bind(this);
    this.onGripUp = this.onGripDown.bind(this);
    this.onTriggerDown = this.onTriggerDown.bind(this);
    this.onTriggerUp = this.onTriggerUp.bind(this);
    this.el.addEventListener("gripdown", this.onGripDown);
    this.el.addEventListener("gripup", this.onGripUp);
    this.el.addEventListener("triggerdown", this.onTriggerDown);
    this.el.addEventListener("triggerup", this.onTriggerUp);
  },

  remove: function () {
    this.el.removeEventListener("gripdown", this.onGripDown);
    this.el.removeEventListener("gripup", this.onGripUp);
    this.el.removeEventListener("triggerdown", this.onTriggerDown);
    this.el.removeEventListener("triggerup", this.onTriggerUp);
  },

  onGripDown: function (e) {
    this.data.gripDown = true;
  },
  onGripUp: function (e) {
    this.data.gripDown = false;
  },
  onTriggerDown: function (e) {
    this.data.triggerDown = true;
  },
  onTriggerUp: function (e) {
    this.data.triggerDown = false;
  },
});
