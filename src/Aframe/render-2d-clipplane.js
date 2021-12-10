const KEYS = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "KeyP",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
];

AFRAME.registerComponent("render-2d-clipplane", {
  schema: {
    xBounds: { type: "array", default: [0, 1] },
    yBounds: { type: "array", default: [0, 1] },
    zBounds: { type: "array", default: [0, 1] },

    // Loader uses these values
    activateClipPlane: { type: "boolean", default: true },
    clipX: { type: "vec2" },
    clipY: { type: "vec2" },
    clipZ: { type: "vec2" },
  },

  init: function () {
    this.active = false;
    this.rendererPlane = false;
    this.keys = {};

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  },

  tick: function (time, timeDelta) {
    // TODO: Figure out how these deal with loader.js
    this.data.clipX = { x: this.data.xBounds[0], y: this.data.xBounds[1] };
    this.data.clipY = { x: this.data.yBounds[0], y: this.data.yBounds[1] };
    this.data.clipZ = { x: this.data.zBounds[0], y: this.data.zBounds[1] };

    // These are never called because of keys
    if (this.keys.KeyQ && !this.active) this.active = true;
    if (this.keys.KeyS && this.active) this.active = false;


    
    // activateClipPlane when active is true and rendererPlane is false
    if (this.active && !this.rendererPlane) {
      this.data.activateClipPlane = true;
      this.rendererPlane = true;
    }
    if (!this.active && this.rendererPlane) {
      this.data.activateClipPlane = false;
      this.rendererPlane = false;
    }
  },

  remove: function () {
    window.removeEventListener("keydown", this.onKeydown);
    window.removeEventListener("keyup", this.onKeyUp);
  },

  onKeyDown: function (event) {
    const code = event.code;
    if (this.isVrModeOn) return;
    if (KEYS.indexOf(code) !== -1) this.keys[code] = true;
  },

  onKeyUp: function (event) {
    const code = event.code;
    delete this.keys[code];
  },
});
