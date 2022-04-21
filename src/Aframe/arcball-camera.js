import AFRAME, { THREE } from "aframe";
import "./arcball-controller.js";

const { Vector3, Matrix4, TrackballControls } = THREE;

AFRAME.registerComponent("arcball-camera", {
  dependencies: ["camera"],

  schema: {
    initialPosition: { type: "vec3" },
  },

  init: function () {
    const el = this.el;

    this.oldPosition = new Vector3();
    this.oldMatrix = new Matrix4();
    this.meshObjectHandler =
      document.getElementById("volume-container").object3D;

    // Create controls
    this.controls = new TrackballControls(
      el.getObject3D("camera"),
      el.sceneEl.renderer.domElement
    );
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

    // Bind functions and add event listeners
    this.onEnterVR = AFRAME.utils.bind(this.onEnterVR, this);
    this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);
    el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    el.sceneEl.addEventListener("exit-vr", this.onExitVR);

    // Move camera to initial position
    el.getObject3D("camera").position.copy(this.data.initialPosition);
  },

  onEnterVR: function () {
    const el = this.el;
    if (
      !AFRAME.utils.device.checkHeadsetConnected() &&
      !AFRAME.utils.device.isMobile()
    ) {
      return;
    }

    this.controls.enabled = false;
    if (el.hasAttribute("look-controls")) {
      el.setAttribute("look-controls", "enabled", true);

      // Store position from before VR and move to origin
      this.oldMatrix.copy(this.meshObjectHandler.matrixWorld);
      this.oldPosition.copy(el.getObject3D("camera").position);
      el.getObject3D("camera").position.set(0, 0, 0);
    }
  },

  onExitVR: function () {
    const el = this.el;

    if (
      !AFRAME.utils.device.checkHeadsetConnected() &&
      !AFRAME.utils.device.isMobile()
    ) {
      return;
    }
    this.controls.enabled = true;
    el.getObject3D("camera").position.set(this.oldPosition);

    if (el.hasAttribute("look-controls")) {
      el.setAttribute("look-controls", "enabled", false);
    }
  },

  tick: function () {
    if (this.controls.enabled) {
      this.controls.update();
    }
  },

  remove: function () {
    this.controls.reset();
    this.controls.dispose();
    this.el.sceneEl.removeEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.removeEventListener("exit-vr", this.onExitVR);
  },
});
