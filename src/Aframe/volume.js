import AFRAME, { THREE } from "aframe";

import {
  Blending,
  DEFAULT_SLIDERS,
  DEFAULT_MATERIAL,
} from "../constants/index.js";
import { deepDifference, partitionPromises } from "../utils/index";

const {
  LinearFilter,
  RGBAFormat,
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
    const initMaterial = DEFAULT_MATERIAL.clone();
    initMaterial.uniforms.viewPort.value = new Vector2(
      this.scene.canvas.width,
      this.scene.canvas.height
    );
    this.getMesh().material = initMaterial;
  },

  update: function (oldData) {
    const diffObject = deepDifference(oldData, this.data);

    if ("models" in diffObject) this.updateModels();
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

  /** UPDATE FUNCTIONS */

  updateModels: function () {
    const { models } = this.data;

    // Asynchronously loop through the data.models array
    // Each element runs serially and this.updateModels waits for all of the promises to finish
    Promise.allSettled(
      models.map(
        async (
          {
            name,
            path,
            colorMap,
            transferFunction,
            intensity,
            useTransferFunction,
          },
          idx
        ) => {
          try {
            // Load texture from png
            const texture = await this.loadTexture(path);

            // Load THREE DataTexture from color map's png and model.transferFunction
            const colorData = await this.loadColorMap(colorMap.path);
            const transferTexture = this.buildTransferTexture(
              colorData,
              transferFunction
            );

            return {
              intensity,
              useTransferFunction,
              texture,
              transferTexture,
            };
          } catch (error) {
            throw new Error("Failed to load model '" + name + "'", {
              cause: error,
            });
          }
        }
      )
    ).then((promises) => {
      const { values: models, errors } = partitionPromises(promises);

      if (errors.length) {
        // Bubble errors up to AframeScene
        document.dispatchEvent(
          new CustomEvent("aframe-error", {
            detail: errors,
          })
        );
      } else {
        // Update uniforms
        // TEMP: Only use first model (TODO: #68)
        const uniforms = this.getUniforms();
        if (models.length) {
          const modelData = models[0];
          uniforms.intensity.value = modelData.intensity;
          uniforms.model_texture.value = modelData.texture;
          uniforms.transfer_texture.value = modelData.transferTexture;
        } else {
          const defaultUniforms = DEFAULT_MATERIAL.clone().uniforms;
          uniforms.intensity.value = defaultUniforms.intensity.value;
          uniforms.model_texture.value = defaultUniforms.model_texture.value;
          uniforms.transfer_texture.value =
            defaultUniforms.transfer_texture.value;
        }

        this.updateSpacing(); // Update spacing based on the new material
      }
    });
  },

  updateBlending: function () {
    const { blending } = this.data;
    const uniforms = this.getUniforms();
    uniforms.blending.value = blending;
  },

  updateSlices: function () {
    const { slices } = this.data;
    const uniforms = this.getUniforms();

    uniforms.slices.value = slices;
    uniforms.dim.value = Math.ceil(Math.sqrt(slices));
  },

  updateSpacing: function () {
    const { spacing } = this.data;
    const uniforms = this.getUniforms();

    const texture = uniforms.model_texture.value;
    const dim = uniforms.dim.value;
    const slices = uniforms.slices.value;

    if (texture) {
      const volumeScale = new Vector3(
        1.0 / ((texture.image.width / dim) * spacing.x),
        1.0 / ((texture.image.height / dim) * spacing.y),
        1.0 / (slices * spacing.z)
      );
      uniforms.zScale.value = volumeScale.x / volumeScale.z;
    }
  },

  // Update clipping uniforms from sliders (reset if !activateClipPlane)
  updateClipping: function () {
    const { x, y, z } = this.data.sliders;
    const uniforms = this.getUniforms();
    if (this.el.getAttribute("keypress-listener").activateClipPlane) {
      uniforms.clip_min.value = new Vector3(x[0], y[0], z[0]);
      uniforms.clip_max.value = new Vector3(x[1], y[1], z[1]);
    } else {
      uniforms.clip_min.value = new Vector3(0, 0, 0);
      uniforms.clip_max.value = new Vector3(1, 1, 1);
    }
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
    uniforms.vr_clip_matrix.value = clipMatrix;
    uniforms.apply_vr_clip.value =
      this.scene.is("vr-mode") &&
      this.controllerObject.el.getAttribute("buttons-check").gripDown &&
      !this.grabbed;
  },

  /** HELPER FUNCTIONS */

  getMesh: function () {
    return this.el.getObject3D("mesh");
  },

  getUniforms: function () {
    return this.getMesh().material.uniforms;
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

      new THREE.ImageLoader().load(
        colorMapPath,
        (image) => {
          const ctx = document.createElement("canvas").getContext("2d");

          // Draw image and extrapolate RGB data
          ctx.drawImage(image, 0, 0);
          const colorData = ctx.getImageData(0, 0, image.width, 1).data;
          resolve(colorData);
        },
        () => {},
        () => {
          reject(new Error("Invalid colorMap path: " + colorMapPath));
        }
      );
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
});
