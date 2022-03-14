/* globals AFRAME THREE */

import { get } from "lodash";
import "./Shader.js";

const bind = AFRAME.utils.bind;

AFRAME.registerComponent("volume", {
  dependencies: ["hand", "render-2d-clipplane", "buttons-check"],
  schema: {
    models: { parse: JSON.parse, default: [] },
  },

  init: function () {
    this.scene = this.el.sceneEl;
    this.canvas = this.scene.canvas;
    this.modelsData = [];
    this.alphaData = []; // These will be for each individual model
    this.colorMapData = []; // These will be for each individual model
    this.rayCollided = false;
    this.grabbed = false;

    // Get other entities
    this.controllerObject = document.getElementById("hand").object3D;
    this.controllerObject.matrixAutoUpdate = false;
    this.clipPlaneListenerHandler = document.getElementById(
      "clipplane2DListener"
    ).object3D;

    // Bind functions
    // TODO: Remove some of these?
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
  },

  update: function (oldData) {
    if (oldData.models !== this.data.models) {
      console.log("UPDATE", this.data.models);
      const models = this.data.models;

      Promise.all(
        models.map(async (model) => {
          const modelData = { name: model.name };
          // console.log("modelData NAME", modelData);

          const texture = await this.loadModelTexture(model);
          modelData.texture = texture;
          // console.log("modelData TEXTURE", modelData);

          const material = await this.loadModelMaterial(model, texture)
          modelData.material = material
          console.log("modelData MATERIAl", modelData);


          // modelData.colorMapData
          // modelData.alphaData

          return modelData;
        })
      ).then(
        (result) => {
          this.modelsData = result;
          console.log("All models loaded", this.modelsData);
        },
        (error) => console.error("Models could not be loaded:", error) 
      );
    }
    // TODO: Use some sort of update flag to detect when promise.all is complete?
    console.log("OUTSIDE", this.modelsData)
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

  async loadModelTexture(model) {
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
        () => reject(new Error("Could not load the data at", model.path))
      );
    });
  },

  async loadModelMaterial(model, texture) {
    const { channel, intensity, spacing, slices, useTransferFunction } = model;
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
    uniforms.viewPort.value = new THREE.Vector2(this.canvas.width, this.canvas.height);
    uniforms.zScale.value = zScale;

    // Set material properties from model
    uniforms.channel.value = channel;
    uniforms.useLut.value = useTransferFunction;

    // Update clipping material from sliders (ignore if !activateClipPlane)
    // const activateClipPlane = this.clipPlaneListenerHandler.el.getAttribute(
      // "render-2d-clipplane"
    // ).activateClipPlane;
    const activateClipPlane = false; // TEMP
    // TODO: Pass sliders into volume
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

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide, // The volume shader uses the "backface" as its reference point
    });
    material.needsUpdate = true;

    return material;
  },

  loadModel: function () {
    console.log("loadModel");
    const { spacing, slices, path, useTransferFunction, intensity } = this.data;

    // Clear mesh and load new model
    if (this.getMesh()) this.el.removeObject3D("mesh");
    new THREE.TextureLoader().load(
      path,
      (texture) => {
        console.log("LOAD MODEL", texture);
        // Create 3D material from texture
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Above is for texture

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

        // Model is a unit cube with the file's material
        // TODO: Move to separate function
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
    let colorMapPath = this.data.colorMap.path;

    /* 
      colorMapPath is either a png encoded string or the path to a png

      png encoded strings begin with data:image/png;64
      Add ; that was removed to parse into aframe correctly
    */
    if (colorMapPath.startsWith("data:image/png"))
      colorMapPath =
        colorMapPath.substring(0, 14) + ";" + colorMapPath.substring(14);

    // Create and image and canvas
    const img = document.createElement("img");
    img.src = colorMapPath;
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
    }
  },

  // TODO: Will be able to remove this
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
    }
  },

  // TODO: Will be able to remove this
  updateChannel: function () {
    const mesh = this.getMesh();
    if (mesh) {
      const material = mesh.material;
      material.uniforms.channel.value = this.data.channel;
      material.uniforms.useLut.value = this.data.useTransferFunction;
      material.needsUpdate = true;
    }
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
