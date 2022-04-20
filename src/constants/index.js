import { THREE } from "aframe";

import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";
import vertexShader from "../Aframe/vertex-shader.vert";
import fragmentShader from "../Aframe/fragment-shader.frag";

const { BackSide, Vector2, Vector3, Matrix4 } = THREE;

/** ENUM and EXAMPLES */

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

const DEFAULT_MATERIAL = {
  uniforms: {
    blending: { value: 0 },
    box_max: { value: new Vector3(1, 1, 1) },
    box_min: { value: new Vector3() },
    clipping: { value: false },
    clipPlane: { value: new Matrix4() },
    dim: { value: 1.0 },
    intensity: { value: 1.0 },
    models: { value: null },
    slices: { value: 1.0 },
    step_size: { value: 0.01 },
    u_data: { value: null },
    u_lut: { value: null },
    useLut: { value: true },
    viewPort: { value: new Vector2() },
    zScale: { value: 1.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  side: BackSide, // Shader uses "backface" as its reference point
};

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
