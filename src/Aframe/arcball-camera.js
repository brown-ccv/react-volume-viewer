import "./arcball-controller.js";

AFRAME.registerComponent("arcball-camera", {
  dependencies: ["camera"],

  init: function () {
    const el = this.el;

    // Bind functions
    this.onEnterVR = AFRAME.utils.bind(this.onEnterVR, this);
    this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);

    // Move camera to 0, 0, 1
    el.getObject3D("camera").position.copy({ x: 0, y: 0, z: 1 });

    // Initialize controls
    this.controls = new THREE.TrackballControls(
      el.getObject3D("camera"),
      el.sceneEl.renderer.domElement
    );
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

    // Add event listeners
    el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    el.sceneEl.addEventListener("exit-vr", this.onExitVR);
  },

  // Set controls false and look-controls true
  onEnterVR: function () {
    if (
      !AFRAME.utils.device.checkHeadsetConnected() &&
      !AFRAME.utils.device.isMobile()
    ) {
      return;
    } else {
      this.controls.enabled = false;
      this.el.getObject3D("camera").position.set(0, 0, 0);
      if (this.el.hasAttribute("look-controls")) {
        this.el.setAttribute("look-controls", "enabled", true);
      }
    }
  },

  // Set controls true and look-controls false
  onExitVR: function () {
    if (
      !AFRAME.utils.device.checkHeadsetConnected() &&
      !AFRAME.utils.device.isMobile()
    ) {
      return;
    } else {
      this.controls.enabled = true;
      this.el.getObject3D("camera").position.set(0, 0, 2);

      if (this.el.hasAttribute("look-controls")) {
        this.el.setAttribute("look-controls", "enabled", false);
      }
    }
  },

  tick: function () {
    this.controls.enabled && this.controls.update();
  },

  remove: function () {
    this.controls.reset();
    this.controls.dispose();
    this.el.sceneEl.removeEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.removeEventListener("exit-vr", this.onExitVR);
  },
});
