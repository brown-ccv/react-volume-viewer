/* globals AFRAME THREE */

import "./Shader.js";
import {
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_MODEL,
  DEFAULT_COLOR_MAP,
  DEFAULT_SLIDERS,
} from "../constants/constants";

const bind = AFRAME.utils.bind;

// TODO: loadModel asynchronously (trying to apply texture before it's created)
// TODO: bind this to THREE.loadTexture
// TODO: Handle slider changes in update not tick

AFRAME.registerComponent("model", {
  dependencies: ["render-2d-clipplane", "buttons-check"],
  schema: {
    // colorMap: { type: "string", default: DEFAULT_COLOR_MAP.path },
    colorMap: { parse: JSON.parse, default: DEFAULT_COLOR_MAP },
    sliders: { parse: JSON.parse, default: DEFAULT_SLIDERS },
    transferFunction: { parse: JSON.parse, default: DEFAULT_TRANSFER_FUNCTION },
    useTransferFunction: { type: "boolean", default: false },
    channel: { type: "number", default: DEFAULT_MODEL.channel },
    intensity: { type: "number", default: DEFAULT_MODEL.intensity },
    path: { type: "string" },
    slices: { type: "number", default: DEFAULT_MODEL.slices },
    spacing: { parse: JSON.parse, default: DEFAULT_MODEL.spacing },
  },

  init: function () {
    this.sceneHandler = this.el.sceneEl;
    this.canvas = this.el.sceneEl.canvas;
    this.colorMapData = [];
    this.alphaData = [];
    this.rayCollided = false;
    this.grabbed = false;

    // Get other entities
    this.controllerHandler = document.getElementById("rhand").object3D;
    this.controllerHandler.matrixAutoUpdate = false;
    this.clipPlaneListenerHandler = document.getElementById(
      "clipplane2DListener"
    ).object3D;

    // Bind functions
    this.onEnterVR = bind(this.onEnterVR, this);
    this.onExitVR = bind(this.onExitVR, this);
    this.onCollide = this.onCollide.bind(this);
    this.onClearCollide = this.onClearCollide.bind(this);
    this.getMesh = this.getMesh.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.loadColorMap = this.loadColorMap.bind(this);
    this.updateTransferTexture = this.updateTransferTexture.bind(this);
    this.updateOpacityData = this.updateOpacityData.bind(this);
    this.updateMeshClipMatrix = this.updateMeshClipMatrix.bind(this);

    // Add event listeners
    this.el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.addEventListener("exit-vr", this.onExitVR);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.el.addEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );

    // Activate camera
    const cameraEl = document.querySelector("#camera");
    cameraEl.setAttribute("camera", "active", true);

    // Load data and colorMap
    this.loadModel();
    this.loadColorMap();
  },

  update: function (oldData) {
    // Update model
    if (oldData.path !== this.data.path) this.loadModel();

    // Update color map
    if (oldData.colorMap !== this.data.colorMap) {
      this.loadColorMap();
    }

    if (this.data.useTransferFunction) {
      // Update transfer function
      if (oldData.transferFunction !== this.data.transferFunction)
        this.updateOpacityData();
    } else {
      // Update channel
      if (oldData.channel !== this.data.channel) this.updateChannel();
    }
  },

  tick: function (time, timeDelta) {
    const isVrModeActive = this.sceneHandler.is("vr-mode");
    const mesh = this.getMesh();

    if (!isVrModeActive && this.clipPlaneListenerHandler) {
      // Not in VR, controlled by clipPlanelistenerHandler
      const activateClipPlane = this.clipPlaneListenerHandler.el.getAttribute(
        "render-2d-clipplane"
      ).activateClipPlane;

      // TODO: Run on sliders Update, not tick
      if (mesh) {
        const material = mesh.material;
        if (activateClipPlane) {
          const sliders = this.data.sliders;
          material.uniforms.box_min.value = new THREE.Vector3(
            sliders.x[0],
            sliders.y[0],
            sliders.z[0]
          );
          material.uniforms.box_max.value = new THREE.Vector3(
            sliders.x[1],
            sliders.y[1],
            sliders.z[1]
          );
        } else {
          // Ignore sliders
          material.uniforms.box_min.value = new THREE.Vector3(0, 0, 0);
          material.uniforms.box_max.value = new THREE.Vector3(1, 1, 1);
        }
      }
    } else if (this.controllerHandler && isVrModeActive) {
      // In VR, position controlled by controllerHandler
      const grabObject =
        this.controllerHandler.el.getAttribute("buttons-check").grabObject;

      if (this.grabbed && !grabObject) {
        mesh.matrix.premultiply(this.controllerHandler.matrixWorld);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.el.object3D.add(mesh);
        this.grabbed = false;
      }

      // grab mesh
      if (!this.grabbed && grabObject && this.rayCollided) {
        const inverseControllerPos = new THREE.Matrix4();
        inverseControllerPos.getInverse(this.controllerHandler.matrixWorld);
        mesh.matrix.premultiply(inverseControllerPos);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.controllerHandler.add(mesh);
        this.grabbed = true;
      }
      this.updateMeshClipMatrix();
    }
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.removeEventListener("exit-vr", this.onExitVR);
    this.el.removeEventListener("raycaster-intersected", this.onCollide);
    this.el.removeEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );
  },

  /** EVENT LISTENER FUNCTIONS */

  onEnterVR: function () {},

  onExitVR: function () {
    const mesh = this.getMesh();
    if (mesh) {
      mesh.position.copy(new THREE.Vector3());
      mesh.rotation.set(0, 0, 0);
    }
  },

  onCollide: function (event) {
    this.rayCollided = true;
  },

  onClearCollide: function (event) {
    this.rayCollided = false;
  },

  /** HELPER FUNCTIONS */

  getMesh: function () {
    return this.el.getObject3D("mesh");
  },

  loadModel: function () {
    const { spacing, slices, path, useTransferFunction, intensity } = this.data;

    // Clear mesh
    const mesh = this.getMesh();
    if (mesh) this.el.removeObject3D("mesh");

    new THREE.TextureLoader().load(
      path,
      (texture) => {
        // Create 3D material from texture
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        const dim = Math.ceil(Math.sqrt(slices));
        const volumeScale = [
          1.0 / ((texture.image.width / dim) * spacing.x),
          1.0 / ((texture.image.height / dim) * spacing.y),
          1.0 / (slices * spacing.z),
        ];
        const zScale = volumeScale[0] / volumeScale[2];

        // Set material properties
        const shader = THREE.ShaderLib["ModelShader"];
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms.dim.value = dim;
        uniforms.intensity.value = intensity;
        uniforms.slice.value = slices;
        uniforms.step_size.value = new THREE.Vector3(0.01, 0.01, 0.01);
        uniforms.u_data.value = texture;
        uniforms.viewPort.value = new THREE.Vector2(
          this.canvas.width,
          this.canvas.height
        );
        uniforms.zScale.value = zScale;
        if (useTransferFunction) {
          uniforms.channel.value = 1;
          uniforms.useLut.value = true;
        } else {
          uniforms.channel.value = 6;
          uniforms.useLut.value = false;
        }

        const material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          transparent: true,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide, // The volume shader uses the "backface" as its reference point
        });

        // Model is a 1x1x1 box with the file's material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.el.setObject3D("mesh", new THREE.Mesh(geometry, material));
        material.needsUpdate = true;

        // Update colorMapping/data channel once model is loaded
        if (useTransferFunction) this.loadColorMap();
        else this.updateChannel();
        // }.bind(this),
      },
      () => {},
      () => {
        throw new Error("Could not load the data at", path);
      }
    );
  },

  loadColorMap: function () {
    const colorMap = this.data.colorMap;

    // Re-inject local image with semi-colon
    if (colorMap.path.startsWith("data:image/png")) {
      colorMap.path =
        colorMap.path.substring(0, 14) + ";" + colorMap.path.substring(14);
    }

    // Create and image and canvas
    const img = document.createElement("img");
    img.src = colorMap.path;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Draw img on the canvas and grab RGB data
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const colorData = ctx.getImageData(0, 0, img.width, 1).data;
      const colorTransfer = new Uint8Array(3 * 256);

      // Extract RGB values from colorMap (ignore alpha)
      for (let i = 0; i < 256; i++) {
        colorTransfer[i * 3 + 0] = colorData[i * 4 + 0];
        colorTransfer[i * 3 + 1] = colorData[i * 4 + 1];
        colorTransfer[i * 3 + 2] = colorData[i * 4 + 2];
      }
      this.colorMapData = colorTransfer;

      this.updateTransferTexture();
    };
  },

  updateTransferTexture: function () {
    const colorMapData = this.colorMapData;
    const imageTransferData = new Uint8Array(4 * 256);
    for (let i = 0; i < 256; i++) {
      imageTransferData[i * 4 + 0] = colorMapData[i * 3 + 0];
      imageTransferData[i * 4 + 1] = colorMapData[i * 3 + 1];
      imageTransferData[i * 4 + 2] = colorMapData[i * 3 + 2];
      imageTransferData[i * 4 + 3] = this.alphaData[i];
    }
    const transferTexture = new THREE.DataTexture(
      imageTransferData,
      256,
      1,
      THREE.RGBAFormat
    );
    transferTexture.needsUpdate = true;

    // TODO: updateTransferFunction and such are running before loadModel is compete
    // Apply transfer texture
    if (this.getMesh()) {
      const material = this.getMesh().material;
      material.uniforms.u_lut.value = transferTexture;
      material.uniforms.channel.value = this.data.channel;
      material.uniforms.useLut.value = this.data.useTransferFunction;
      material.needsUpdate = true;
    } else console.log("MODEL NOT LOADED YET");
  },

  updateChannel: function () {
    if (this.getMesh()) {
      const material = this.getMesh().material;
      material.uniforms.channel.value = this.data.channel;
      material.uniforms.useLut.value = this.data.useTransferFunction;
      material.needsUpdate = true;
    } else console.log("MODEL NOT LOADED YET");
  },

  updateOpacityData: function () {
    this.alphaData = [];
    const transferFunction = this.data.transferFunction;
    for (let i = 0; i < transferFunction.length - 1; i++) {
      const start = transferFunction[i];
      const end = transferFunction[i + 1];
      const deltaX = end.x * 255 - start.x * 255;

      // Linear interpolation between points
      const alphaStart = start.y * 255;
      const alphaEnd = end.y * 255;
      for (let j = 1 / deltaX; j < 1; j += 1 / deltaX) {
        this.alphaData.push(alphaStart * (1 - j) + alphaEnd * j);
      }
    }
    this.updateTransferTexture();
  },

  updateMeshClipMatrix: function () {
    const volumeMatrix = this.getMesh().matrixWorld;
    const material = this.getMesh().material;

    //scalematrix for zscaling
    const scaleMatrix = new THREE.Matrix4();
    scaleMatrix.makeScale(1, 1, material.uniforms.zScale.value);

    //translationmatrix to cube-coordinates ranging from 0 -1
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-0.5, -0.5, -0.5);

    //inverse of the clipMatrix
    const controllerMatrix = this.controllerHandler.matrixWorld;
    const controllerMatrix_inverse = new THREE.Matrix4();
    controllerMatrix_inverse.copy(controllerMatrix).invert();

    //outputmatrix - controller_inverse * volume * scale * translation
    const clipMatrix = new THREE.Matrix4();
    clipMatrix.multiplyMatrices(controllerMatrix_inverse, volumeMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, scaleMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, translationMatrix);

    //set uniforms of shader
    const isVrModeActive = this.sceneHandler.is("vr-mode");
    const doClip =
      isVrModeActive &&
      this.controllerHandler.el.getAttribute("buttons-check").clipPlane &&
      !this.grabbed;
    material.uniforms.clipPlane.value = clipMatrix;
    material.uniforms.clipping.value = doClip;
  },
});
