/* globals AFRAME THREE */

import { DEFAULT_SLIDERS } from "../constants/index.js";
import "./Shader.js";

const bind = AFRAME.utils.bind;

AFRAME.registerComponent("volume", {
  dependencies: ["hand", "render-2d-clipplane", "buttons-check"],
  schema: {
    models: { parse: JSON.parse, default: [] },
    sliders: { parse: JSON.parse, default: DEFAULT_SLIDERS },
  },

  init: function () {
    this.scene = this.el.sceneEl;
    this.canvas = this.scene.canvas;
    this.modelsData = [];
    // this.alphaData = [];
    // this.colorMapData = [];
    this.rayCollided = false;
    this.grabbed = false;

    // Initialize shader material
    this.shader = THREE.ShaderLib["ModelShader"];
    this.DEFAULT_MATERIAL = {
      uniforms: THREE.UniformsUtils.clone(this.shader.uniforms),
      transparent: true,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
      side: THREE.BackSide, // The volume shader uses the "backface" as its reference point
    };

    // Get aframe entities
    this.controllerObject = document.getElementById("hand").object3D;
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
    this.updateMeshClipMatrix = this.updateMeshClipMatrix.bind(this);

    // Add event listeners
    this.scene.addEventListener("enter-vr", this.onEnterVR);
    this.scene.addEventListener("exit-vr", this.onExitVR);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.el.addEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );

    // Initialize mesh to shader defaults
    this.el.setObject3D(
      "mesh",
      new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.ShaderMaterial(this.DEFAULT_MATERIAL)
      )
    );
  },

  update: function (oldData) {
    // TODO: Only change this.modelsData based on difference between oldData and this.data
    if (oldData.models !== this.data.models) {
      Promise.all(
        this.data.models.map(async (model) => {
          // Load data
          const name = await model.name;
          const texture = await this.loadTexture(model);
          const material = await this.loadMaterial(model, texture);
          const transferTexture = await this.loadTransferTexture(
            model.colorMap.path,
            model.transferFunction
          );

          // Update material
          material.uniforms.u_lut.value = transferTexture;
          material.needsUpdate = true;

          // TODO: Return object directly
          const modelData = {
            name,
            texture,
            material,
            transferTexture,
          };
          console.log("modelData", modelData);
          return modelData;
        })
      )
        .then((result) => {
          this.modelsData = result;
          console.log("All models loaded", this.modelsData);
          this.buildMesh();
        })
        .catch((error) => console.error("Loading failed:", error));
    }
  },

  tick: function (time, timeDelta) {
    const isVrModeActive = this.scene.is("vr-mode");
    const mesh = this.getMesh();

    // Position is controlled by controllerObject in VR
    if (this.controllerObject && isVrModeActive) {
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

  async loadTexture(model) {
    // TODO: Store a map of used model paths so you don't have to keep re-calculating
    return await new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        model.path,
        (texture) => {
          texture.minFilter = texture.magFilter = THREE.LinearFilter;
          texture.unpackAlignment = 1;
          texture.needsUpdate = true;

          resolve(texture);
        },
        () => {},
        () => reject(new Error("Could not load the model at " + model.path))
      );
    });
  },

  async loadMaterial(model, texture) {
    const { channel, intensity, spacing, slices, useTransferFunction } = model;
    const dim = Math.ceil(Math.sqrt(slices));
    const volumeScale = [
      1.0 / ((texture.image.width / dim) * spacing.x),
      1.0 / ((texture.image.height / dim) * spacing.y),
      1.0 / (slices * spacing.z),
    ];
    const zScale = volumeScale[0] / volumeScale[2];

    // Set material properties
    const uniforms = THREE.UniformsUtils.clone(this.shader.uniforms);
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

    // Set material properties from model
    uniforms.channel.value = channel;
    uniforms.useLut.value = useTransferFunction;

    // Update clipping material from sliders (ignore if !activateClipPlane)
    const activateClipPlane = this.clipPlaneListenerHandler.el.getAttribute(
      "render-2d-clipplane"
    ).activateClipPlane;
    if (activateClipPlane) {
      const sliders = this.data.sliders;
      uniforms.box_min.value = new THREE.Vector3(
        sliders.x[0],
        sliders.y[0],
        sliders.z[0]
      );
      uniforms.box_max.value = new THREE.Vector3(
        sliders.x[1],
        sliders.y[1],
        sliders.z[1]
      );
    } else {
      uniforms.box_min.value = new THREE.Vector3(0, 0, 0);
      uniforms.box_max.value = new THREE.Vector3(1, 1, 1);
    }

    // TODO: Only, keep a constant for the rest?
    const material = new THREE.ShaderMaterial({
      ...this.DEFAULT_MATERIAL,
      uniforms: uniforms,
    });
    material.needsUpdate = true;

    return material;
  },

  async loadTransferTexture(colorMapPath, transferFunction) {
    // TODO: Store a map of used colorMaps so you don't have to keep re-calculating
    return await new Promise((resolve, reject) => {
      /* 
      colorMapPath is either a png encoded string or the path to a png

      png encoded strings begin with data:image/png;64
      Add ; that was removed to parse into aframe correctly
    */
      if (colorMapPath.startsWith("data:image/png"))
        colorMapPath =
          colorMapPath.substring(0, 14) + ";" + colorMapPath.substring(14);

      // Create an image and canvas
      const img = document.createElement("img");
      img.src = colorMapPath;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Get RGB data from color map
        ctx.drawImage(img, 0, 0);
        const colorData = ctx.getImageData(0, 0, img.width, 1).data;

        // Get alpha data from transfer function
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

        // Build the transfer texture
        const imageTransferData = new Uint8Array(4 * 256);
        for (let i = 0; i < 256; i++) {
          for (let j = 0; j < 3; j++)
            imageTransferData[i * 4 + j] = colorData[i * 4 + j];
          imageTransferData[i * 4 + 3] = alphaData[i];
        }
        const transferTexture = new THREE.DataTexture(
          imageTransferData,
          256,
          1,
          THREE.RGBAFormat
        );
        transferTexture.needsUpdate = true;
        resolve(transferTexture);
      };
      img.onerror = () =>
        reject(new Error("Could not load the color map at " + colorMapPath));
    });
  },

  // TODO: Blend all of the models together
  // Blend model's into a single mesh and apply it to the model
  buildMesh: function () {
    if (this.modelsData.length > 0) {
      // TODO: Just update the mesh properties instead of creating a new one?
      this.el.setObject3D(
        "mesh",
        new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          this.modelsData[0].material
        )
      );
      this.modelsData[0].material.needsUpdate = true;
    }
  },

  updateMeshClipMatrix: function () {
    const mesh = this.getMesh();
    const volumeMatrix = mesh.matrixWorld;
    const material = mesh.material;

    // Matrix for zscaling
    const scaleMatrix = new THREE.Matrix4().makeScale(
      1,
      1,
      material.uniforms.zScale.value
    );

    // Translate to cube-coordinates ranging from 0 -1
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      -0.5,
      -0.5,
      -0.5
    );

    // Inverse of the clip matrix
    const controllerMatrix_inverse = new THREE.Matrix4()
      .copy(this.controllerObject.matrixWorld)
      .invert();

    // clipMatrix = controller_inverse * volume * scale * translation
    const clipMatrix = controllerMatrix_inverse;
    clipMatrix.multiplyMatrices(clipMatrix, volumeMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, scaleMatrix);
    clipMatrix.multiplyMatrices(clipMatrix, translationMatrix);

    // Update shader uniforms
    material.uniforms.clipPlane.value = clipMatrix;
    material.uniforms.clipping.value =
      this.scene.is("vr-mode") &&
      this.controllerObject.el.getAttribute("buttons-check").clipPlane &&
      !this.grabbed;
  },
});
