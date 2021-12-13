// import { THREE } from "aframe";
import "./VolumeViewerShader";

AFRAME.registerComponent("loader", {
  schema: {
    rayCollided: { type: "boolean", default: false },

    // TODO: Combine transferFunction?
    transferFunctionX: { type: "array", default: [0, 1] },
    transferFunctionY: { type: "array", default: [0, 1] },
    colorMap: { type: "string", default: "" },
    path: { type: "string", default: "" },
    slices: { type: "number", default: 55 },
    spacing: { type: "array", default: [1, 1, 1] },
    useTransferFunction: { type: "boolean", default: false },
    xBounds: { type: "array", default: [0, 1] },
    yBounds: { type: "array", default: [0, 1] },
    zBounds: { type: "array", default: [0, 1] },
  },

  init: function () {
    this.canvas = this.el.sceneEl.canvas;
    this.sceneHandler = this.el.sceneEl;
    this.grabbed = false;
    this.colorMapNeedsUpdate = false;
    this.colorTransferMap = new Map();

    // Get rhand entity
    this.controllerHandler = document.getElementById("rhand").object3D;
    this.controllerHandler.matrixAutoUpdate = false;

    // Bind functions
    this.loadModel = this.loadModel.bind(this);
    this.updateTransferTexture = this.updateTransferTexture.bind(this);
    this.loadColorMap = this.loadColorMap.bind(this);
    this.onCollide = this.onCollide.bind(this);
    this.onClearCollide = this.onClearCollide.bind(this);
    this.onEnterVR = AFRAME.utils.bind(this.onEnterVR, this);
    this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);

    // Add event listeners
    this.el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.addEventListener("exit-vr", this.onExitVR);
    this.el.addEventListener("raycaster-intersected", this.onCollide);
    this.el.addEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );
  },

  update: function (oldData) {
    const {
      colorMap,
      path,
      transferFunctionX,
      transferFunctionY,
      xBounds,
      yBounds,
      zBounds,
    } = this.data;
    if (
      (transferFunctionX && oldData.transferFunctionX !== transferFunctionX) ||
      (transferFunctionY && oldData.transferFunctionY !== transferFunctionY)
    ) {
      // Update opacity data
      // TODO: This should be included in updateTransferTexture
      this.newAlphaData = [];
      for (let i = 0; i <= transferFunctionX.length - 2; i++) {
        const scaledColorInit = transferFunctionX[i] * 255;
        const scaledColorEnd = transferFunctionX[i + 1] * 255;
        const scaledAlphaInit = transferFunctionY[i] * 255;
        const scaledAlphaEnd = transferFunctionY[i + 1] * 255;
        const deltaX = scaledColorEnd - scaledColorInit;
        // linear interpolation
        for (let j = 1 / deltaX; j < 1; j += 1 / deltaX) {
          this.newAlphaData.push(
            scaledAlphaInit * (1 - j) + scaledAlphaEnd * j
          );
        }
      }
      this.updateTransferTexture();
    }

    if (
      this.getMesh() &&
      xBounds &&
      yBounds &&
      zBounds &&
      (oldData.xBounds !== xBounds ||
        oldData.yBounds !== yBounds ||
        oldData.zBounds !== zBounds)
    ) {
      const material = this.getMesh().material;
      material.uniforms.box_min.value = new THREE.Vector3(
        xBounds[0],
        yBounds[0],
        zBounds[0]
      );
      material.uniforms.box_max.value = new THREE.Vector3(
        xBounds[1],
        yBounds[1],
        zBounds[1]
      );
    }

    if (colorMap && oldData.colorMap !== colorMap) this.loadColorMap();
    if (path && oldData.path !== path) this.loadModel();
  },

  tick: function (time, timeDelta) {
    const inVR = this.sceneHandler.is("vr-mode");
    if (this.controllerHandler && inVR) {
      const buttonsCheck =
        this.controllerHandler.el.getAttribute("buttons-check");

      if (!buttonsCheck.grabObject && this.grabbed) {
        const mesh = this.getMesh();
        mesh.matrix.premultiply(this.controllerHandler.matrixWorld);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.el.object3D.add(mesh);

        this.grabbed = false;
      }

      // grab mesh
      if (buttonsCheck.grabObject && this.data.rayCollided && !this.grabbed) {
        const inverseControllerPos = new THREE.Matrix4();
        const mesh = this.getMesh();
        inverseControllerPos.copy(this.controllerHandler.matrixWorld).invert();
        mesh.matrix.premultiply(inverseControllerPos);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        this.controllerHandler.add(mesh);

        this.grabbed = true;
      }
      this.updateMeshClipMatrix(this.controllerHandler.matrixWorld);
    }
  },

  remove: function () {
    this.el.removeEventListener("raycaster-intersected", this.onCollide);
    this.el.removeEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );
    this.el.sceneEl.removeEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.removeEventListener("exit-vr", this.onExitVR);
  },

  /* HELPER FUNCTIONS */

  getMesh: function () {
    return this.el.getObject3D("mesh");
  },

  loadModel: function () {
    const el = this.el;
    const data = this.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const loadColorMap = this.loadColorMap;

    // Load model as a 2D texture
    new THREE.TextureLoader().load(
      data.path,
      // onLoad callback
      (texture) => {
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        const { slices, spacing, useTransferFunction } = this.data;
        const shader = THREE.ShaderLib.volumeViewer;
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        const dim = Math.ceil(Math.sqrt(slices));
        const volumeScale = [
          1.0 / ((texture.image.width / dim) * spacing[0]),
          1.0 / ((texture.image.height / dim) * spacing[1]),
          1.0 / (slices * spacing[2]),
        ];
        const zScale = volumeScale[0] / volumeScale[2];

        uniforms.dim.value = dim;
        uniforms.P_inv.value = new THREE.Matrix4();
        uniforms.slice.value = slices;
        uniforms.step_size.value = new THREE.Vector3(0.01, 0.01, 0.01);
        uniforms.u_data.value = texture;
        uniforms.viewPort.value = new THREE.Vector2(width, height);
        uniforms.zScale.value = zScale;

        // TODO: What to do when not using transfer function?
        if (!useTransferFunction) {
          uniforms.channel.value = 6;
          uniforms.useLut.value = false;
        }

        const material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          transparent: true,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide, // Use the backface as its "reference point"
        });
        material.needsUpdate = true;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        el.setObject3D("mesh", new THREE.Mesh(geometry, material));

        loadColorMap();
      },
      // onProgress callback
      null,
      // onError callback
      (err) => console.error("Could not load model:", path, err)
    );
  },

  loadColorMap: function () {
    // TODO: Parse error if can't load this.data.colorMap
    if (!this.colorTransferMap.has(this.data.colorMap)) {
      const colorCanvas = document.createElement("canvas");
      const imgWidth = 255;
      const imgHeight = 15;

      // Re-inject local image with comma
      if (this.data.colorMap.startsWith("data:image/png")) {
        this.data.colorMap =
          this.data.colorMap.substring(0, 14) +
          ";" +
          this.data.colorMap.substring(14);
      }

      const newColorMap = {
        img: document.createElement("img"),
        width: imgWidth,
        height: imgHeight,
        data: null,
      };
      newColorMap.img.src = this.data.colorMap;

      this.colorTransferMap.set(this.data.colorMap, newColorMap);
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

  updateTransferTexture: function () {
    if (this.colorTransferMap.has(this.data.colorMap)) {
      const colorTransfer = this.colorTransferMap.get(this.data.colorMap).data;
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

      if (this.getMesh()) {
        let material = this.getMesh().material;
        material.uniforms.u_lut.value = transferTexture;
        material.uniforms.useLut.value = true;
        material.needsUpdate = true;
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
    const inVR = this.sceneHandler.is("vr-mode");
    const doClip =
      inVR &&
      this.controllerHandler.el.getAttribute("buttons-check").clipPlane &&
      !this.grabbed;
    material.uniforms.clipPlane.value = clipMatrix;
    material.uniforms.clipping.value = doClip;
  },

  /* EVENT LISTENERS FUNCTIONS */

  onEnterVR: function () {},

  onExitVR: function () {
    if (this.getMesh()) {
      this.getMesh().position.copy(new THREE.Vector3());
      this.getMesh().rotation.set(0, 0, 0);
    }
  },

  onCollide: function (e) {
    this.data.rayCollided = true;
  },

  onClearCollide: function (e) {
    this.data.rayCollided = false;
  },
});
