import AFRAME, { THREE } from "aframe";

import { DEFAULT_SLIDERS, DEFAULT_MATERIAL } from "../constants/index.js";

const {
  UniformsUtils,
  LinearFilter,
  RGBAFormat,
  ShaderMaterial,
  Vector2,
  Vector3,
  Matrix4,
  TextureLoader,
  DataTexture,
} = THREE;

AFRAME.registerComponent("volume", {
  dependencies: ["keypress-listener"], // Adds component to the entity
  schema: {
    models: { parse: JSON.parse, default: [] },
    sliders: { parse: JSON.parse, default: DEFAULT_SLIDERS },
  },

  init: function () {
    this.scene = this.el.sceneEl;
    this.canvas = this.scene.canvas;
    this.usedModels = new Map(); // Cache models (path: texture)
    this.usedColorMaps = new Map(); // Cache color maps (path: RGB data)
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

    // Initialize material to shader defaults
    this.getMesh().material = new THREE.ShaderMaterial(DEFAULT_MATERIAL);
  },

  update: function (oldData) {
    const { data, usedModels, usedColorMaps } = this; // Extra read-only data

    // TODO: Only change based on difference between oldData and this.data
    if (oldData !== data) {
      // Asynchronously loop through the data.models array
      // Each element runs serially and .map() buildMesh() waits for map to finish
      Promise.all(
        data.models.map(async (model) => {
          const { name, path, colorMap, transferFunction } = model;

          // Load texture from png
          const texture = usedModels.has(path)
            ? usedModels.get(path)
            : await this.loadTexture(model.path);

          // Load THREE DataTexture from color map's png and model.transferFunction
          const colorData = usedColorMaps.has(colorMap.path)
            ? usedColorMaps.get(colorMap.path)
            : await this.loadColorMap(colorMap.path);
          const transferTexture = await this.loadTransferTexture(
            colorData,
            transferFunction
          );

          // TODO: All we really need is the material - Map(name -> material)
          const material = this.buildMaterial(model, texture, transferTexture);
          return {
            name: name,
            texture,
            material,
            transferTexture,
          };
        })
      )
        .then((result) => this.buildMesh(result))
        .catch((error) => console.error(error));
    }
  },

  tick: function (time, timeDelta) {
    const isVrModeActive = this.scene.is("vr-mode");
    const mesh = this.getMesh();

    // Position is controlled by controllerObject in VR
    if (this.controllerObject && isVrModeActive) {
      const triggerDown =
        this.controllerObject.el.getAttribute("buttons-check").triggerDown;

      // Stop grabbing object
      if (this.grabbed && !triggerDown) {
        mesh.matrix.premultiply(this.controllerObject.matrixWorld);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.el.object3D.add(mesh);
        this.grabbed = false;
      }

      // Grab object
      if (!this.grabbed && triggerDown && this.rayCollided) {
        const inverseControllerPos = new Matrix4();
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
      mesh.position.copy(new Vector3());
      mesh.rotation.set(0, 0, 0);
    }
  },

  // TODO: onCollide is called once at runtime and is always true
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
  loadTexture(modelPath) {
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
        () => reject(new Error("Could not load the model at " + modelPath))
      );
    });
  },

  // Load color map data (RGB)
  loadColorMap(colorMapPath) {
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
        reject(new Error("Could not load the color map: " + colorMapPath));
      };
    });
  },

  // Create a THREE DataTexture from the RGB and A data
  loadTransferTexture(colorData, transferFunction) {
    return new Promise((resolve, reject) => {
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
      resolve(transferTexture);
    });
  },

  // Build THREE ShaderMaterial from model and color map
  buildMaterial(model, texture, transferTexture) {
    const { channel, intensity, spacing, slices, useTransferFunction } = model;

    const dim = Math.ceil(Math.sqrt(slices));
    const volumeScale = [
      1.0 / ((texture.image.width / dim) * spacing.x),
      1.0 / ((texture.image.height / dim) * spacing.y),
      1.0 / (slices * spacing.z),
    ];
    const zScale = volumeScale[0] / volumeScale[2];

    // Set uniforms from model
    const uniforms = UniformsUtils.clone(DEFAULT_MATERIAL.uniforms);
    uniforms.step_size.value = new Vector3(0.01, 0.01, 0.01);
    uniforms.viewPort.value = new Vector2(
      this.canvas.width,
      this.canvas.height
    );

    uniforms.dim.value = dim;
    uniforms.zScale.value = zScale;

    uniforms.channel.value = channel;
    uniforms.intensity.value = intensity;
    uniforms.slice.value = slices;
    uniforms.useLut.value = useTransferFunction;

    uniforms.u_data.value = texture;
    uniforms.u_lut.value = transferTexture;

    // Update clipping uniforms from sliders (ignore if !activateClipPlane)
    if (this.el.getAttribute("keypress-listener").activateClipPlane) {
      const sliders = this.data.sliders;
      uniforms.box_min.value = new Vector3(
        sliders.x[0],
        sliders.y[0],
        sliders.z[0]
      );
      uniforms.box_max.value = new Vector3(
        sliders.x[1],
        sliders.y[1],
        sliders.z[1]
      );
    } else {
      uniforms.box_min.value = new Vector3(0, 0, 0);
      uniforms.box_max.value = new Vector3(1, 1, 1);
    }

    // Create material
    return new ShaderMaterial({
      ...DEFAULT_MATERIAL,
      uniforms: uniforms,
    });
  },

  // Blend model's into a single material and apply it to the model
  buildMesh: function (modelsData) {
    if (!modelsData.length) return; //TEMP

    // TODO: Blend all of the model's material into one
    const materials = modelsData.map((model) => model.material);

    // TEMP
    this.getMesh().material = materials[0]; // TEMP;
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
