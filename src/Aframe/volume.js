import AFRAME, { THREE } from "aframe";

import { deepDifference } from "../utils/index.js";
import {
  Blending,
  DEFAULT_SLIDERS,
  DEFAULT_MATERIAL,
} from "../constants/index.js";

const {
  UniformsUtils,
  LinearFilter,
  RGBAFormat,
  RawShaderMaterial,
  Vector2,
  Vector3,
  Matrix4,
  TextureLoader,
  DataTexture,
} = THREE;

AFRAME.registerComponent("volume", {
  dependencies: ["keypress-listener"], // Adds component to the entity
  schema: {
    blending: { parse: JSON.parse, default: Blending.None },
    models: { parse: JSON.parse, default: [] },
    slices: { type: "int" },
    spacing: { type: "vec3" },
    sliders: { parse: JSON.parse, default: DEFAULT_SLIDERS },
  },

  init: function () {
    this.scene = this.el.sceneEl;
    this.usedModels = new Map(); // Cache models (path: texture)
    this.usedColorMaps = new Map(); // Cache color maps (path: RGB data)
    this.uniforms = new Map(); // Map each model to it's uniform (name: uniform)
    this.rayCollided = false;
    this.grabbed = false;

    // Get aframe entities
    this.controllerObject = document.getElementById("hand").object3D;
    this.controllerObject.matrixAutoUpdate = false;

    // Bind functions
    this.onEnterVR = AFRAME.utils.bind(this.onEnterVR, this);
    this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);
    this.onCollide = this.onCollide.bind(this);
    this.onClearCollide = this.onClearCollide.bind(this);
    this.getMesh = this.getMesh.bind(this);
    this.updateMeshClipMatrix = this.updateMeshClipMatrix.bind(this);

    // Add event listeners
    this.scene.addEventListener("enter-vr", this.onEnterVR);
    this.scene.addEventListener("exit-vr", this.onExitVR);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.el.addEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );

    // Initialize material
    const initMaterial = DEFAULT_MATERIAL;
    initMaterial.uniforms.viewPort.value = new Vector2(
      this.scene.canvas.width,
      this.scene.canvas.height
    );
    this.getMesh().material = new RawShaderMaterial(initMaterial);
  },

  update: function (oldData) {
    const { data, usedModels, usedColorMaps } = this;
    const diffObject = deepDifference(oldData, data);

    // Update model uniforms
    if ("models" in diffObject) {
      this.uniforms = new Map();
      // Asynchronously loop through the data.models array
      // Each element runs serially and this.updateMaterial waits for all of the promises to finish
      Promise.allSettled(
        data.models.map(async (model) => {
          const { name, path, colorMap, transferFunction } = model;
          try {
            // Load texture from png
            const texture = usedModels.has(path)
              ? usedModels.get(path)
              : await this.loadTexture(model.path);

            // Load THREE DataTexture from color map's png and model.transferFunction
            const colorData = usedColorMaps.has(colorMap.path)
              ? usedColorMaps.get(colorMap.path)
              : await this.loadColorMap(colorMap.path);
            const transferTexture = this.buildTransferTexture(
              colorData,
              transferFunction
            );

            // Build the uniform
            this.uniforms.set(
              model.name,
              this.buildUniform(model, texture, transferTexture)
            );
          } catch (error) {
            throw new Error("Failed to load model '" + name + "'", {
              cause: error,
            });
          }
        })
      ).then((promises) => {
        const errors = promises
          .filter((p) => p.status === "rejected")
          .map((p) => p.reason);

        if (errors.length) {
          // Bubble errors up to AframeScene
          document.dispatchEvent(
            new CustomEvent("aframe-error", {
              detail: errors,
            })
          );
        } else this.updateMaterial();
      });
    }

    // Update other uniforms
    if ("blending" in diffObject) this.updateBlending();
    if ("slices" in diffObject) this.updateSlices();
    if ("spacing" in diffObject) this.updateSpacing();
    if ("sliders" in diffObject) this.updateClipping();
  },

  tick: function (time, timeDelta) {
    // Position is controlled by controllerObject in VR
    if (this.controllerObject && this.scene.is("vr-mode")) {
      const mesh = this.getMesh();
      const triggerDown =
        this.controllerObject.el.getAttribute("buttons-check").triggerDown;

      // Grab object
      if (!this.grabbed && triggerDown && this.rayCollided) {
        mesh.matrix.premultiply(this.controllerObject.matrixWorld.invert());
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.controllerObject.add(mesh);
        this.grabbed = true;
      }

      // Stop grabbing object
      if (this.grabbed && !triggerDown) {
        mesh.matrix.premultiply(this.controllerObject.matrixWorld);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.el.object3D.add(mesh); // Add? Shouldn't this be setObject3D?
        this.grabbed = false;
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
      mesh.position.copy(new Vector3());
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

  // Load THREE Texture from the model's path
  loadTexture: function (modelPath) {
    return new Promise((resolve, reject) => {
      new TextureLoader().load(
        modelPath,
        (texture) => {
          texture.minFilter = texture.magFilter = LinearFilter;
          texture.unpackAlignment = 1;
          texture.needsUpdate = true;

          this.usedModels.set(modelPath, texture);
          resolve(texture);
        },
        () => {},
        () => reject(new Error("Invalid model path: " + modelPath))
      );
    });
  },

  // Load color map data (RGB)
  loadColorMap: function (colorMapPath) {
    return new Promise((resolve, reject) => {
      /*  colorMapPath is either a png encoded string or the path to a png
        png encoded strings begin with data:image/png;64
        Add ; that was removed to parse into aframe correctly
      */
      colorMapPath = colorMapPath.startsWith("data:image/png")
        ? colorMapPath.substring(0, 14) + ";" + colorMapPath.substring(14)
        : colorMapPath;

      // Create canvas to load image on
      const img = document.createElement("img");
      img.src = colorMapPath;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      img.onload = () => {
        // Draw image and extrapolate RGB data
        ctx.drawImage(img, 0, 0);
        const colorData = ctx.getImageData(0, 0, img.width, 1).data;
        this.usedColorMaps.set(colorMapPath, colorData);
        resolve(colorData);
      };
      img.onerror = () => {
        reject(new Error("Invalid colorMap path: " + colorMapPath));
      };
    });
  },

  // Create a THREE DataTexture from the RGB and A data
  buildTransferTexture: function (colorData, transferFunction) {
    // Load alpha data from transfer function
    const alphaData = [];
    for (let i = 0; i < transferFunction.length - 1; i++) {
      const start = transferFunction[i];
      const end = transferFunction[i + 1];
      const deltaX = end.x * 255 - start.x * 255;

      // Linear interpolation between points
      const alphaStart = start.y * 255;
      const alphaEnd = end.y * 255;
      for (let j = 1 / deltaX; j < 1; j += 1 / deltaX) {
        alphaData.push(alphaStart * (1 - j) + alphaEnd * j);
      }
    }

    // Combine RGB and A data
    const rgbaData = new Uint8Array(4 * 256);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 3; j++) rgbaData[i * 4 + j] = colorData[i * 4 + j];
      rgbaData[i * 4 + 3] = alphaData[i];
    }

    const transferTexture = new DataTexture(rgbaData, 256, 1, RGBAFormat);
    transferTexture.needsUpdate = true;
    return transferTexture;
  },

  // Build THREE RawShaderMaterial from model and color map
  buildUniform: function (model, texture, transferTexture) {
    const { intensity, useTransferFunction } = model;
    const uniforms = UniformsUtils.clone(DEFAULT_MATERIAL.uniforms);

    // Resize viewport to scene
    uniforms.viewPort.value = new Vector2(
      this.scene.canvas.width,
      this.scene.canvas.height
    );

    // Apply model properties
    uniforms.intensity.value = intensity;
    uniforms.use_lut.value = useTransferFunction;
    uniforms.u_data.value = texture; // Model data
    uniforms.u_lut.value = transferTexture; // Color Map + transfer function

    // blending, sliders, slices, and spacing are updated separately
    const otherUniforms = this.getMesh().material.uniforms;
    uniforms.blending.value = otherUniforms.blending.value;
    uniforms.box_min.value = otherUniforms.box_min.value;
    uniforms.box_max.value = otherUniforms.box_max.value;
    uniforms.slices.value = otherUniforms.slices.value;
    uniforms.dim.value = otherUniforms.dim.value;
    uniforms.zScale.value = otherUniforms.zScale.value;
    return uniforms;
  },

  updateBlending: function () {
    const { blending } = this.data;
    const uniforms = this.getMesh().material.uniforms;
    uniforms.blending.value = blending;
  },

  updateSlices: function () {
    const { slices } = this.data;
    const uniforms = this.getMesh().material.uniforms;

    uniforms.slices.value = slices;
    uniforms.dim.value = Math.ceil(Math.sqrt(slices));
  },

  updateSpacing: function () {
    const { spacing } = this.data;
    const uniforms = this.getMesh().material.uniforms;
    const texture = uniforms.u_data.value; // Image
    const dim = uniforms.dim.value;
    const slices = uniforms.slices.value;

    const volumeScale = texture
      ? // Scale is based on the texture's size
        new Vector3(
          1.0 / ((texture.image.width / dim) * spacing.x),
          1.0 / ((texture.image.height / dim) * spacing.y),
          1.0 / (slices * spacing.z)
        )
      : // Texture hasn't been loaded yet
        new Vector3(
          1.0 / ((0 / dim) * spacing.x),
          1.0 / ((0 / dim) * spacing.y),
          1.0 / (slices * spacing.z)
        );
    uniforms.zScale.value = volumeScale.x / volumeScale.z;
  },

  // Update clipping uniforms from sliders (reset if !activateClipPlane)
  updateClipping: function () {
    const uniforms = this.getMesh().material.uniforms;
    const { x, y, z } = this.data.sliders;
    if (this.el.getAttribute("keypress-listener").activateClipPlane) {
      uniforms.box_min.value = new Vector3(x[0], y[0], z[0]);
      uniforms.box_max.value = new Vector3(x[1], y[1], z[1]);
    } else {
      uniforms.box_min.value = new Vector3(0, 0, 0);
      uniforms.box_max.value = new Vector3(1, 1, 1);
    }
  },

  // Blend model's into a single material and apply it to the model
  updateMaterial: function () {
    this.getMesh().material =
      this.uniforms.size > 0
        ? // TEMP - use first material
          new RawShaderMaterial({
            ...DEFAULT_MATERIAL,
            uniforms: this.uniforms.values().next().value,
          })
        : // No models - use default material
          new RawShaderMaterial(DEFAULT_MATERIAL);

    this.updateSpacing(); // Update spacing based on the new material
  },

  updateMeshClipMatrix: function () {
    const mesh = this.getMesh();
    const uniforms = mesh.material.uniforms;

    const volumeMatrix = mesh.matrixWorld;
    const scaleMatrix = new Matrix4().makeScale(1, 1, uniforms.zScale.value);
    const translationMatrix = new Matrix4().makeTranslation(-0.5, -0.5, -0.5);
    const inverseControllerMatrix = new Matrix4()
      .copy(this.controllerObject.matrixWorld)
      .invert();

    // clipMatrix = controller_inverse * volume * scale * translation
    const clipMatrix = inverseControllerMatrix;
    clipMatrix.multiplyMatrices(clipMatrix, volumeMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, scaleMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, translationMatrix);

    // Update shader uniforms
    uniforms.clipPlane.value = clipMatrix;
    uniforms.clipping.value =
      this.scene.is("vr-mode") &&
      this.controllerObject.el.getAttribute("buttons-check").gripDown &&
      !this.grabbed;
  },
});
