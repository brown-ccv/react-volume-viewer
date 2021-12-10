import { THREE } from "aframe";
import "./ccvLibVolumeShader.js";

AFRAME.registerComponent("loader", {
  schema: {
    rayCollided: { type: "boolean", default: false },
    modelLoaded: { type: "boolean", default: false },

    transferFunctionX: { type: "array", default: [0, 1] },
    transferFunctionY: { type: "array", default: [0, 1] },
    colorMap: { type: "string", default: "" },
    path: { type: "string", default: "" },
    slices: { type: "number", default: 55 },

    // TODO: Spacing should be a vec3
    x_spacing: { type: "number", default: 2.0 },
    y_spacing: { type: "number", default: 2.0 },
    z_spacing: { type: "number", default: 1.0 },
    useTransferFunction: { type: "boolean", default: false },
  },

  init: function () {
    // TODO: Combine spacing and transferFunction
    this.colorMap = this.data.colorMap;
    this.canvas = this.el.sceneEl.canvas;
    this.sceneHandler = this.el.sceneEl;
    this.grabbed = false;
    this.colorMapNeedsUpdate = false;
    this.colorTransferMap = new Map();
    this.clip2DPlaneRendered = false;

    // Get rhand entity
    this.controllerHandler = document.getElementById("rhand").object3D;
    this.controllerHandler.matrixAutoUpdate = false;

    // Get clipplane2DListener entity
    this.clipPlaneListenerHandler = document.getElementById(
      "clipplane2DListener"
    ).object3D;

    // Bind functions
    this.loadModel = this.loadModel.bind(this);
    this.updateTransferTexture = this.updateTransferTexture.bind(this);
    this.updateColorMapping = this.updateColorMapping.bind(this);
    this.updateOpacityData = this.updateOpacityData.bind(this);
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

  getMesh: function () {
    return this.el.getObject3D("mesh");
  },

  onEnterVR: function () {},

  onExitVR: function () {
    if (this.getMesh()) {
      this.getMesh().position.copy(new THREE.Vector3());
      this.getMesh().rotation.set(0, 0, 0);
    }
  },

  onCollide: function (event) {
    this.data.rayCollided = true;
  },

  onClearCollide: function (event) {
    this.data.rayCollided = false;
  },

  loadModel: function () {
    const el = this.el;
    const data = this.data;
    const updateColorMapping = this.updateColorMapping;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const {
      x_spacing,
      y_spacing,
      z_spacing,
      slices,
      path,
      useTransferFunction,
    } = data;

    if (!path || path === "") return;

    // Load model as a 2D texture
    new THREE.TextureLoader().load(
      path,
      function (texture) {
        const dim = Math.ceil(Math.sqrt(slices));
        const spacing = [x_spacing, y_spacing, z_spacing];
        const volumeScale = [
          1.0 / ((texture.image.width / dim) * spacing[0]),
          1.0 / ((texture.image.height / dim) * spacing[1]),
          1.0 / (slices * spacing[2]),
        ];
        const zScale = volumeScale[0] / volumeScale[2];

        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Material
        const shader = THREE.ShaderLib["ccvLibVolumeRenderShader"];
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["u_data"].value = texture;
        uniforms["u_lut"].value = null;
        uniforms["clipPlane"].value = new THREE.Matrix4();
        uniforms["clipping"].value = false;
        uniforms["threshold"].value = 1;
        uniforms["multiplier"].value = 1;
        uniforms["slice"].value = slices;
        uniforms["dim"].value = dim;

        // TODO: What to do when not using transfer function?
        if (!useTransferFunction) {
          uniforms["channel"].value = 6;
        }

        uniforms["useLut"].value = false;
        uniforms["step_size"].value = new THREE.Vector3(
          1 / 100,
          1 / 100,
          1 / 100
        );
        uniforms["viewPort"].value = new THREE.Vector2(
          canvasWidth,
          canvasHeight
        );
        uniforms["P_inv"].value = new THREE.Matrix4();
        uniforms["depth"].value = null;
        uniforms["zScale"].value = zScale;
        uniforms["controllerPoseMatrix"].value = new THREE.Matrix4();
        uniforms["grabMesh"].value = false;
        uniforms["box_min"].value = new THREE.Vector3(0, 0, 0);
        uniforms["box_max"].value = new THREE.Vector3(1, 1, 1);

        const material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          transparent: true,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide, // The volume shader uses the backface as its "reference point"
        });

        // Mesh
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        el.setObject3D("mesh", new THREE.Mesh(geometry, material));
        data.modelLoaded = true;
        material.needsUpdate = true;

        updateColorMapping();
      },
      function () {},
      function () {
        console.error("Could not load model:", path);
      }
    );
  },

  updateTransferTexture: function () {
    if (this.colorTransferMap.has(this.colorMap)) {
      const colorTransfer = this.colorTransferMap.get(this.colorMap).data;
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

  updateColorMapping: function () {
    if (!this.colorTransferMap.has(this.colorMap)) {
      const colorCanvas = document.createElement("canvas");

      const imgWidth = 255;
      const imgHeight = 15;
      const newColorMap = {
        img: document.createElement("img"),
        width: imgWidth,
        height: imgHeight,
        data: null,
      };

      // Re-inject local image with comma
      if (this.colorMap.startsWith("data:image/png")) {
        this.colorMap =
          this.colorMap.substring(0, 14) + ";" + this.colorMap.substring(14);
      }

      newColorMap.img.src = this.colorMap;
      this.colorTransferMap.set(this.colorMap, newColorMap);
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

  update: function (oldData) {
    if (oldData === undefined) {
      return;
    }
    if (
      (this.data.transferFunctionX !== undefined &&
        oldData.transferFunctionX !== this.data.transferFunctionX) ||
      (this.data.transferFunctionY !== undefined &&
        oldData.transferFunctionY !== this.data.transferFunctionY)
    ) {
      this.updateOpacityData(
        this.data.transferFunctionX,
        this.data.transferFunctionY
      );
      this.updateTransferTexture();
    }

    if (oldData.colorMap !== this.data.colorMap) {
      this.colorMap = this.data.colorMap;
      this.updateColorMapping();
    }

    if (oldData.path !== this.data.path) {
      this.loadModel();
    }
  },

  updateOpacityData: function (arrayX, arrayY) {
    this.newAlphaData = [];

    for (let i = 0; i <= arrayX.length - 2; i++) {
      const scaledColorInit = arrayX[i] * 255;
      const scaledColorEnd = arrayX[i + 1] * 255;

      const scaledAplhaInit = arrayY[i] * 255;
      const scaledAlphaEnd = arrayY[i + 1] * 255;

      const deltaX = scaledColorEnd - scaledColorInit;

      for (let j = 1 / deltaX; j < 1; j += 1 / deltaX) {
        // linear interpolation
        this.newAlphaData.push(scaledAplhaInit * (1 - j) + scaledAlphaEnd * j);
      }
    }
  },

  tick: function (time, timeDelta) {
    const isVrModeActive = this.sceneHandler.is("vr-mode");
    if (this.data.modelLoaded) {
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

          if (this.getMesh()) {
            const material = this.getMesh().material;
            material.uniforms.box_min.value = new THREE.Vector3(0, 0, 0);
            material.uniforms.box_max.value = new THREE.Vector3(1, 1, 1);
          }
        }

        if (this.clip2DPlaneRendered) {
          if (this.getMesh()) {
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
          this.data.rayCollided &&
          !this.grabbed
        ) {
          const inverseControllerPos = new THREE.Matrix4();
          inverseControllerPos
            .copy(this.controllerHandler.matrixWorld)
            .invert();
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

  remove: function () {
    this.el.removeEventListener("raycaster-intersected", this.onCollide);
    this.el.removeEventListener(
      "raycaster-intersected-cleared",
      this.onClearCollide
    );
    this.el.sceneEl.removeEventListener("enter-vr", this.onEnterVR);
    this.el.sceneEl.removeEventListener("exit-vr", this.onExitVR);
  },
});
