/* globals AFRAME THREE */
import "./Shader.js";
import {
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_MODEL,
  DEFAULT_COLOR_MAP,
} from "../constants/constants";

const bind = AFRAME.utils.bind;

AFRAME.registerComponent("model", {
  schema: {
    colorMap: { type: "string", default: DEFAULT_COLOR_MAP },
    transferFunction: {
      parse: JSON.parse,
      default: DEFAULT_TRANSFER_FUNCTION,
    },
    useTransferFunction: { type: "boolean", default: false },
    channel: { type: "number", default: DEFAULT_MODEL.channel },
    intensity: { type: "number", default: DEFAULT_MODEL.intensity },
    path: { type: "string" },
    slices: { type: "number", default: DEFAULT_MODEL.slices },
    spacing: {
      parse: JSON.parse,
      default: DEFAULT_MODEL.spacing,
    },
  },

  init: function () {
    this.colorTransferMap = new Map();
    this.newAlphaData = [];
    this.rayCollided = false;
    this.grabbed = false;
    this.sceneHandler = this.el.sceneEl;
    this.canvas = this.el.sceneEl.canvas;
    this.clip2DPlaneRendered = false;

    // TODO: Leave as this.data.colorMap
    this.currentColorMap = this.data.colorMap;

    // Get other entities
    this.controllerHandler = document.getElementById("rhand").object3D;
    this.controllerHandler.matrixAutoUpdate = false;
    this.clipPlaneListenerHandler = document.getElementById(
      "clipplane2DListener"
    ).object3D;

    // const clipplane2D = document.getElementById("clipplane2D");
    // this.clipPlaneHandler = clipplane2D.object3D;
    // if (clipplane2D !== undefined)
    //   this.clipplane2DHandler = clipplane2D.object3D;

    // Bind functions
    this.onEnterVR = bind(this.onEnterVR, this);
    this.onExitVR = bind(this.onExitVR, this);
    this.onCollide = this.onCollide.bind(this);
    this.onClearCollide = this.onClearCollide.bind(this);
    this.getMesh = this.getMesh.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.updateTransferTexture = this.updateTransferTexture.bind(this);
    this.updateDataChannel = this.updateDataChannel.bind(this);
    this.updateColorMapping = this.updateColorMapping.bind(this);
    this.updateOpacityData = this.updateOpacityData.bind(this);

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

    // NOT SURE WHAT THIS DOES
    // this.opacityControlPoints = [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    // let jet_values = [
    //   [0, 0, 0.5],
    //   [0, 0, 1],
    //   [0, 0.5, 1],
    //   [0, 1, 1],
    //   [0.5, 1, 0.5],
    //   [1, 1, 0],
    //   [1, 0.5, 0],
    //   [1, 0, 0],
    //   [0.5, 0, 0],
    // ];
    // const pData = [];
    // this.alphaData = [];

    // const indices = [];
    // const zeroArray = [0, 0, 0, 0];

    // //setting up control points
    // for (let i = 0; i < 9; i++) {
    //   const index = i * 28;
    //   while (pData.length < index) {
    //     pData.push(zeroArray);
    //   }

    //   pData.push([
    //     jet_values[i][0] * 255,
    //     jet_values[i][1] * 255,
    //     jet_values[i][2] * 255,
    //     this.opacityControlPoints[i] * 255,
    //   ]);
    //   indices.push(index);
    // }

    // //interpolation between opacity control points
    // for (let j = 0; j < 9 - 1; j++) {
    //   const dDataA = pData[indices[j + 1]][3] - pData[indices[j]][3];
    //   const dIndex = indices[j + 1] - indices[j];
    //   const dDataIncA = dDataA / dIndex;
    //   for (let idx = indices[j] + 1; idx < indices[j + 1]; idx++) {
    //     let alpha = pData[idx - 1][3] + dDataIncA;
    //     this.alphaData[idx] = alpha;
    //   }
    // }

    // // interpolation between colors control points
    // for (let j = 0; j < 9 - 1; j++) {
    //   const dDataR = pData[indices[j + 1]][0] - pData[indices[j]][0];
    //   const dDataG = pData[indices[j + 1]][1] - pData[indices[j]][1];
    //   const dDataB = pData[indices[j + 1]][2] - pData[indices[j]][2];
    //   const dDataA = pData[indices[j + 1]][3] - pData[indices[j]][3];
    //   const dIndex = indices[j + 1] - indices[j];

    //   const dDataIncR = dDataR / dIndex;
    //   const dDataIncG = dDataG / dIndex;
    //   const dDataIncB = dDataB / dIndex;
    //   const dDataIncA = dDataA / dIndex;

    //   for (let idx = indices[j] + 1; idx < indices[j + 1]; idx++) {
    //     const alpha = pData[idx - 1][3] + dDataIncA;
    //     this.alphaData[idx] = alpha;
    //     pData[idx] = [
    //       pData[idx - 1][0] + dDataIncR,
    //       pData[idx - 1][1] + dDataIncG,
    //       pData[idx - 1][2] + dDataIncB,
    //       alpha,
    //     ];
    //   }
    // }
  },

  update: function (oldData) {
    // Update model
    if (oldData.path !== this.data.path) {
      this.loadModel();
    }

    // Update color map
    if (oldData.colorMap !== this.data.colorMap) {
      this.currentColorMap = this.data.colorMap;
      this.updateColorMapping();
    }

    // Update transfer function
    if (
      this.data.useTransferFunction &&
      "transferFunction" in this.data &&
      oldData.transferFunction !== this.data.transferFunction
    ) {
      this.updateOpacityData(this.data.transferFunction);
      this.updateTransferTexture();
    }

    // Update channels
    if (
      !this.data.useTransferFunction &&
      this.data.channel !== undefined &&
      oldData.channel !== this.data.channel
    ) {
      this.updateDataChannel();
    }
  },

  tick: function (time, timeDelta) {
    const isVrModeActive = this.sceneHandler.is("vr-mode");
    if (this.clipPlaneListenerHandler !== undefined && !isVrModeActive) {
      if (
        this.clipPlaneListenerHandler.el.getAttribute("render-2d-clipplane")
          .activateClipPlane &&
        !this.clip2DPlaneRendered
      ) {
        this.clip2DPlaneRendered = true;
      } else if (
        !this.clipPlaneListenerHandler.el.getAttribute("render-2d-clipplane")
          .activateClipPlane &&
        this.clip2DPlaneRendered
      ) {
        this.clip2DPlaneRendered = false;

        if (this.getMesh() !== undefined) {
          const material = this.getMesh().material;
          material.uniforms.box_min.value = new THREE.Vector3(0, 0, 0);
          material.uniforms.box_max.value = new THREE.Vector3(1, 1, 1);
        }
      }

      if (this.clip2DPlaneRendered) {
        if (this.getMesh() !== undefined) {
          const material = this.getMesh().material;

          if (material !== undefined) {
            const sliceX = this.clipPlaneListenerHandler.el.getAttribute(
              "render-2d-clipplane"
            ).clipX;
            const sliceY = this.clipPlaneListenerHandler.el.getAttribute(
              "render-2d-clipplane"
            ).clipY;
            const sliceZ = this.clipPlaneListenerHandler.el.getAttribute(
              "render-2d-clipplane"
            ).clipZ;

            material.uniforms.box_min.value = new THREE.Vector3(
              sliceX.x,
              sliceY.x,
              sliceZ.x
            );
            material.uniforms.box_max.value = new THREE.Vector3(
              sliceX.y,
              sliceY.y,
              sliceZ.y
            );
          }
        }
      }
    } else if (this.controllerHandler !== undefined && isVrModeActive) {
      if (
        !this.controllerHandler.el.getAttribute("buttons-check").grabObject &&
        this.grabbed
      ) {
        this.el
          .getObject3D("mesh")
          .matrix.premultiply(this.controllerHandler.matrixWorld);
        this.el
          .getObject3D("mesh")
          .matrix.decompose(
            this.getMesh().position,
            this.getMesh().quaternion,
            this.getMesh().scale
          );
        this.el.object3D.add(this.getMesh());

        this.grabbed = false;
      }

      // grab mesh
      if (
        this.controllerHandler.el.getAttribute("buttons-check").grabObject &&
        this.rayCollided &&
        !this.grabbed
      ) {
        const inverseControllerPos = new THREE.Matrix4();
        inverseControllerPos.getInverse(this.controllerHandler.matrixWorld);
        this.getMesh().matrix.premultiply(inverseControllerPos);
        this.el
          .getObject3D("mesh")
          .matrix.decompose(
            this.getMesh().position,
            this.getMesh().quaternion,
            this.getMesh().scale
          );
        this.controllerHandler.add(this.getMesh());
        this.grabbed = true;
      }

      this.updateMeshClipMatrix(this.controllerHandler.matrixWorld);
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

  onExitVR: function () {
    if (this.getMesh() !== undefined) {
      this.getMesh().position.copy(new THREE.Vector3());
      this.getMesh().rotation.set(0, 0, 0);
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

  updateTransferTexture: function () {
    if (this.colorTransferMap.has(this.currentColorMap)) {
      const colorTransfer = this.colorTransferMap.get(
        this.currentColorMap
      ).data;
      if (colorTransfer) {
        const imageTransferData = new Uint8Array(4 * 256);
        for (let i = 0; i < 256; i++) {
          imageTransferData[i * 4 + 0] = colorTransfer[i * 3 + 0];
          imageTransferData[i * 4 + 1] = colorTransfer[i * 3 + 1];
          imageTransferData[i * 4 + 2] = colorTransfer[i * 3 + 2];
          imageTransferData[i * 4 + 3] = this.newAlphaData[i];
        }
        const transferTexture = new THREE.DataTexture(
          imageTransferData,
          256,
          1,
          THREE.RGBAFormat
        );
        transferTexture.needsUpdate = true;

        if (this.getMesh() !== undefined) {
          let material = this.getMesh().material;
          // Shader script uses channel 6 for color mapping
          material.uniforms.channel.value = 6;
          material.uniforms.u_lut.value = transferTexture;
          material.uniforms.useLut.value = this.data.useTransferFunction;
          material.needsUpdate = true;
        }
      }
    }
  },

  updateDataChannel: function () {
    if (this.getMesh() !== undefined) {
      let material = this.getMesh().material;
      material.uniforms.channel.value = this.data.channel;
      material.uniforms.useLut.value = this.data.useTransferFunction;
      material.needsUpdate = true;
    }
  },

  loadModel: function () {
    let currentVolume = this.getMesh();
    const { spacing, slices, path } = this.data;
    if (currentVolume !== undefined) {
      //clear mesh
      this.el.removeObject3D("mesh");
      currentVolume = undefined;
    }

    if (path !== "") {
      const el = this.el;
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;

      const useTransferFunction = this.data.useTransferFunction;
      const intensity = this.data.intensity;

      const updateColorMapping = this.updateColorMapping;
      const updateDataChannel = this.updateDataChannel;

      // Load model
      new THREE.TextureLoader().load(
        path,
        function (texture) {
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
            canvasWidth,
            canvasHeight
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
            side: THREE.BackSide, // The volume shader uses the backface as its "reference point"
          });

          // Model is a 1x1x1 box with the file's material
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          el.setObject3D("mesh", new THREE.Mesh(geometry, material));
          material.needsUpdate = true;

          // Update colorMapping/data channel once model is loaded
          if (useTransferFunction) updateColorMapping();
          else updateDataChannel();
        },
        function () {},
        function () {
          throw new Error("Could not load the data at", path);
        }
      );
    }
  },

  updateColorMapping: function () {
    if (!this.colorTransferMap.has(this.currentColorMap)) {
      const colorCanvas = document.createElement("canvas");

      const imgWidth = 255;
      const imgHeight = 15;
      const newColorMap = {
        img: document.createElement("img"),
        width: imgWidth,
        height: imgHeight,
        data: null,
      };

      // Re-inject local image with semi-colon
      if (this.currentColorMap.startsWith("data:image/png")) {
        this.currentColorMap =
          this.currentColorMap.substring(0, 14) +
          ";" +
          this.currentColorMap.substring(14);
      }

      newColorMap.img.src = this.currentColorMap;
      this.colorTransferMap.set(this.currentColorMap, newColorMap);
      const mappedColorMap = newColorMap;

      const updateTransferTexture = this.updateTransferTexture;
      newColorMap.img.onload = function (data) {
        colorCanvas.height = imgHeight;
        colorCanvas.width = imgWidth;
        const colorContext = colorCanvas.getContext("2d");
        colorContext.drawImage(newColorMap.img, 0, 0);
        const colorData = colorContext.getImageData(0, 0, imgWidth, 1).data;
        const colorTransfer = new Uint8Array(3 * 256);
        for (let i = 0; i < 256; i++) {
          colorTransfer[i * 3] = colorData[i * 4];
          colorTransfer[i * 3 + 1] = colorData[i * 4 + 1];
          colorTransfer[i * 3 + 2] = colorData[i * 4 + 2];
        }
        mappedColorMap.data = colorTransfer;

        updateTransferTexture();
      };
    } else {
      this.updateTransferTexture();
    }
  },

  updateOpacityData: function (transferFunction) {
    this.newAlphaData = [];
    for (let i = 0; i < transferFunction.length - 1; i++) {
      const start = transferFunction[i];
      const end = transferFunction[i + 1];
      const deltaX = end.x * 255 - start.x * 255;

      // Linear interpolation between points
      const alphaStart = start.y * 255;
      const alphaEnd = end.y * 255;
      for (let j = 1 / deltaX; j < 1; j += 1 / deltaX) {
        this.newAlphaData.push(alphaStart * (1 - j) + alphaEnd * j);
      }
    }
  },

  updateMeshClipMatrix: function (currentSpaceClipMatrix) {
    const volumeMatrix = this.getMesh().matrixWorld;
    //material for setting the clipPlane and clipping value
    const material = this.getMesh().material;

    //scalematrix for zscaling
    const scaleMatrix = new THREE.Matrix4();
    scaleMatrix.makeScale(1, 1, material.uniforms.zScale.value);

    //translationmatrix to cube-coordinates ranging from 0 -1
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-0.5, -0.5, -0.5);

    //inverse of the clipMatrix
    const currentSpaceClipMatrix_inverse = new THREE.Matrix4();
    currentSpaceClipMatrix_inverse.copy(currentSpaceClipMatrix).invert();

    //outputmatrix - controller_inverse * volume * scale * translation
    const clipMatrix = new THREE.Matrix4();
    clipMatrix.multiplyMatrices(currentSpaceClipMatrix_inverse, volumeMatrix);
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
