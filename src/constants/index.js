import { THREE } from "aframe";

import { deepCopy } from "../utils";
import colormaps from "../images/colormaps";
import vertexShader from "../aframe/vertex-shader.vert";
import fragmentShader from "../aframe/fragment-shader.frag";

const { BackSide, RawShaderMaterial, Vector2, Vector3, Matrix4 } = THREE;

/** EXPORTED CONSTANTS */

const COLOR_MAPS = colormaps;

/**
 * Blending enum exposed to the user
 *  Max: Take maximum value at the given point
 *  Min: Take minimum value at the given point
 *  Average: Average all models at each point
 */
const Blending = {
  Max: 0,
  Min: 1,
  Average: 2,
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

const DEFAULT_MODEL_STRUCT = { use: false };
const DEFAULT_MATERIAL = new RawShaderMaterial({
  uniforms: {
    apply_vr_clip: { value: false },
    blending: { value: 0 },
    clip_max: { value: new Vector3(1, 1, 1) },
    clip_min: { value: new Vector3() },
    dim: { value: 1.0 },
    model_structs: {
      value: deepCopy(new Array(4).fill(DEFAULT_MODEL_STRUCT)),
    },
    slices: { value: 1.0 },
    step_size: { value: 0.01 },
    viewPort: { value: new Vector2() },
    vr_clip_matrix: { value: new Matrix4() },
    zScale: { value: 1.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
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
  DEFAULT_MODEL_STRUCT,
};
