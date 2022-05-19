import { THREE } from "aframe";

import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";
import vertexShader from "../Aframe/vertex-shader.vert";
import fragmentShader from "../Aframe/fragment-shader.frag";

const { BackSide, RawShaderMaterial, Vector2, Vector3, Matrix4 } = THREE;

/** EXPORTED CONSTANTS */

/**
 * Blending enum exposed to the user
 *  None: Don't apply any blending
 *  Add: Apply additive blending
 */
const Blending = {
  None: 0,
  Add: 1,
};

const COLOR_MAPS = {
  Grayscale: { name: "Grayscale", path: grayscale },
  Natural: { name: "Natural", path: natural },
  Rgb: { name: "Rgb", path: rgb },
};

/** DEFAULT VALUES */

const DEFAULT_POSITION = "0 0 0";
const DEFAULT_ROTATION = "0 0 0";
const DEFAULT_SCALE = "1 1 1";
const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

const DEFAULT_MODEL = {
  colorMap: COLOR_MAPS.Grayscale,
  colorMaps: [],
  description: "",
  enabled: true,
  intensity: 1,
  range: { min: 0, max: 1, unit: "" },
  transferFunction: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  useTransferFunction: true,
  useColorMap: true,
};

const entry1 = {
	model_texture: null,
  intensity: 1.0,
  transfer_texture: null
};
const entry2 = {
	model_texture: null,
  intensity: 1.0,
  transfer_texture: null
};

const DEFAULT_MATERIAL = new RawShaderMaterial({
  uniforms: {
    blending: { value: 0 },
    clip_max: { value: new Vector3(1, 1, 1) },
    clip_min: { value: new Vector3() },
    apply_vr_clip: { value: false },
    vr_clip_matrix: { value: new Matrix4() },
    dim: { value: 1.0 },
    intensity: { value: 1.0 },
    model_texture0: { value: null },
    model_texture1: { value: null },
    model_texture2: { value: null },
    volume_models: { value: [entry1,entry2] },
    slices: { value: 1.0 },
    step_size: { value: 0.01 },
    transfer_texture: { value: null },
    viewPort: { value: new Vector2() },
    zScale: { value: 1.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  // transparent: true,
  side: BackSide, // Shader uses "backface" as its reference point
});

export {
  Blending,
  COLOR_MAPS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_MODEL,
  DEFAULT_MATERIAL,
};
