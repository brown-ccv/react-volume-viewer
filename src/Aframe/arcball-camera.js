/* globals AFRAME THREE*/
import "./arcball-controller.js";

const bind = AFRAME.utils.bind;

AFRAME.registerComponent("arcball-camera", {
  dependencies: ["camera"],

  schema: {
    initialPosition: { type: "vec3" },
  },

  init: function () {
    const el = this.el;

    this.oldPosition = new THREE.Vector3();
    this.oldMatrix = new THREE.Matrix4();
    this.meshObjectHandler = document.getElementById("volumeCube").object3D;

    // Move camera to initial position
    el.getObject3D("camera").position.copy(this.data.initialPosition);

    // Create controls
    this.controls = new THREE.TrackballControls(
      el.getObject3D("camera"),
      el.sceneEl.renderer.domElement
    );
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

    // Set the pointer to grab/grabbing when over the vr canvas
    const aCanvas = document.querySelector(".a-canvas");
    aCanvas.style.cursor = "grab";
    document.addEventListener("mousedown", () => {
      aCanvas.style.cursor = "grabbing";
    });
    document.addEventListener("mouseup", () => {
      aCanvas.style.cursor = "grab";
    });

    // Add event listeners and bind functions
    el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    el.sceneEl.addEventListener("exit-vr", this.onExitVR);
    this.onEnterVR = bind(this.onEnterVR, this);
    this.onExitVR = bind(this.onExitVR, this);
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

  update: function (oldData) {
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
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
