/* globals AFRAME THREE */

import "./Shader.js";
import {
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_MODEL,
  DEFAULT_COLOR_MAP,
  DEFAULT_SLIDERS,
} from "../constants/constants";

const bind = AFRAME.utils.bind;

// TODO: The function in THREE.TextureLoader().load (loadModel) needs to run asynchronously
// Before loadColorMap, updateClipping, updateTransferTexture, etc.
// TODO: colorMapData should {[name]: colorMapData}
// Check if color map has already been loaded before - then there's no need to load the data again

AFRAME.registerComponent("model", {
  dependencies: ["render-2d-clipplane", "buttons-check"],
  schema: {
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
    this.scene = this.el.sceneEl;
    this.canvas = this.scene.canvas;
    this.alphaData = [];
    this.colorMapData = [];
    this.rayCollided = false;
    this.grabbed = false;

    // Get other entities
    this.controllerObject = document.getElementById("rhand").object3D;
    this.controllerObject.matrixAutoUpdate = false;
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
    this.updateClipping = this.updateClipping.bind(this);
    this.updateTransferTexture = this.updateTransferTexture.bind(this);
    this.updateOpacityData = this.updateOpacityData.bind(this);
    this.updateMeshClipMatrix = this.updateMeshClipMatrix.bind(this);

    // Add event listeners
    this.scene.addEventListener("enter-vr", this.onEnterVR);
    this.scene.addEventListener("exit-vr", this.onExitVR);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.el.addEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );

    // Activate camera
    document.getElementById("camera").setAttribute("camera", "active", true);

    // Load data and colorMap
    this.loadModel();
    this.loadColorMap();
  },

  update: function (oldData) {
    // Update model
    if (oldData.path !== this.data.path) this.loadModel();

    // Update color map
    if (oldData.colorMap !== this.data.colorMap) this.loadColorMap();

    // Update clipping
    if (oldData.sliders !== this.data.sliders) this.updateClipping();

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
    const isVrModeActive = this.scene.is("vr-mode");
    const mesh = this.getMesh();

    if (this.controllerObject && isVrModeActive) {
      // In VR, position controlled by controllerObject
      const grabObject =
        this.controllerObject.el.getAttribute("buttons-check").grabObject;

      if (this.grabbed && !grabObject) {
        mesh.matrix.premultiply(this.controllerObject.matrixWorld);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.el.object3D.add(mesh);
        this.grabbed = false;
      }

      // grab mesh
      if (!this.grabbed && grabObject && this.rayCollided) {
        const inverseControllerPos = new THREE.Matrix4();
        inverseControllerPos.getInverse(this.controllerObject.matrixWorld);
        mesh.matrix.premultiply(inverseControllerPos);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.controllerObject.add(mesh);
        this.grabbed = true;
      }
      this.updateMeshClipMatrix();
    }
  },

  remove: function () {
    this.scene.removeEventListener("enter-vr", this.onEnterVR);
    this.scene.removeEventListener("exit-vr", this.onExitVR);
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

        // Model is a unit box with the file's material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.el.setObject3D("mesh", new THREE.Mesh(geometry, material));
        material.needsUpdate = true;

        // Update colorMapping/data channel once model is loaded
        if (useTransferFunction) this.loadColorMap();
        else this.updateChannel();
        this.updateClipping();
      },
      () => {},
      () => {
        throw new Error("Could not load the data at", path);
      }
    );
  },

  loadColorMap: function () {
    const colorMap = this.data.colorMap;

    // Re-inject local image path with semi-colon
    if (colorMap.path.startsWith("data:image/png")) {
      colorMap.path =
        colorMap.path.substring(0, 14) + ";" + colorMap.path.substring(14);
    }

    // Create and image and canvas
    const img = document.createElement("img");
    img.src = colorMap.path;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Draw img on the canvas and read RGB data
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const colorData = ctx.getImageData(0, 0, img.width, 1).data;
      const colorTransfer = new Uint8Array(3 * 256);
      for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 3; j++)
          colorTransfer[i * 3 + j] = colorData[i * 4 + j];
      }
      this.colorMapData = colorTransfer;

      this.updateTransferTexture();
    };
  },

  updateTransferTexture: function () {
    const colorMapData = this.colorMapData;
    const imageTransferData = new Uint8Array(4 * 256);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 3; j++)
        imageTransferData[i * 4 + j] = colorMapData[i * 3 + j];
      imageTransferData[i * 4 + 3] = this.alphaData[i];
    }

    const transferTexture = new THREE.DataTexture(
      imageTransferData,
      256,
      1,
      THREE.RGBAFormat
    );
    transferTexture.needsUpdate = true;

    // Apply transfer texture
    const mesh = this.getMesh();
    if (mesh) {
      const material = mesh.material;
      material.uniforms.u_lut.value = transferTexture;
      material.uniforms.channel.value = this.data.channel;
      material.uniforms.useLut.value = this.data.useTransferFunction;
      material.needsUpdate = true;
    } else console.log("MODEL NOT LOADED YET");
  },

  updateClipping: function () {
    const mesh = this.getMesh();
    const activateClipPlane = this.clipPlaneListenerHandler.el.getAttribute(
      "render-2d-clipplane"
    ).activateClipPlane;

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
    } else console.log("MODEL NOT LOADED YET");
  },

  updateChannel: function () {
    const mesh = this.getMesh();
    if (mesh) {
      const material = mesh.material;
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

    // Matrix for zscaling
    const scaleMatrix = new THREE.Matrix4();
    scaleMatrix.makeScale(1, 1, material.uniforms.zScale.value);

    // Translate to cube-coordinates ranging from 0 -1
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-0.5, -0.5, -0.5);

    // Inverse of the clip matrix
    const controllerMatrix = this.controllerObject.matrixWorld;
    const controllerMatrix_inverse = new THREE.Matrix4();
    controllerMatrix_inverse.copy(controllerMatrix).invert();

    //outputmatrix - controller_inverse * volume * scale * translation
    const clipMatrix = new THREE.Matrix4();
    clipMatrix.multiplyMatrices(controllerMatrix_inverse, volumeMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, scaleMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, translationMatrix);

    //set uniforms of shader
    const isVrModeActive = this.scene.is("vr-mode");
    const isClipped =
      isVrModeActive &&
      this.controllerObject.el.getAttribute("buttons-check").clipPlane &&
      !this.grabbed;
    material.uniforms.clipPlane.value = clipMatrix;
    material.uniforms.clipping.value = isClipped;
  },
});
