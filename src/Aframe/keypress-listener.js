/* globals AFRAME  */

/*
  Deactivates clipping (controlled by the sliders) when s is pressed
  Activates clipping when q is pressed
*/
AFRAME.registerComponent("keypress-listener", {
  schema: {
    activateClipPlane: { type: "boolean", default: true },
  },

  init: function () {
    this.onKeyPress = this.onKeyPress.bind(this);
    window.addEventListener("keypress", this.onKeyPress);
  },

  remove: function () {
    window.removeEventListener("keypress", this.onKeyPress);
  },

  onKeyPress: function ({ code }) {
    if (code === "KeyQ") this.data.activateClipPlane = true;
    else if (code === "KeyS") this.data.activateClipPlane = false;
  },
});
