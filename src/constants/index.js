import { THREE } from "aframe";

import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";
import vertexShader from "../Aframe/vertex-shader.vert";
import fragmentShader from "../Aframe/fragment-shader.frag";

/** Default Props */

const grayscaleColorMap = { name: "Grayscale", path: grayscale };
const naturalColorMap = { name: "Natural", path: natural };
const rgbColorMap = { name: "RGB", path: rgb };
const ColorMaps = {
  grayscale: grayscaleColorMap,
  natural: naturalColorMap,
  rgb: rgbColorMap,
};

const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

const DEFAULT_MODEL = {
  channel: 1,
  description: "",
  enabled: true,
  intensity: 1.0,
  range: { min: 0, max: 1, unit: "" },
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useTransferFunction: true,
};

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

const DEFAULT_POSITION = "0 0 0";
const DEFAULT_ROTATION = "0 0 0";
const DEFAULT_SCALE = "1 1 1";

/** OpacityControls.jsx */

const DECIMALS = 2;
const CANVAS_PADDING = 10;
const HOVER_RADIUS = 15;

/** AFRAME Constants */

const { BackSide, Vector2, Vector3, Matrix4 } = THREE;

const DEFAULT_UNIFORMS = {
  box_max: { value: new Vector3(1, 1, 1) },
  box_min: { value: new Vector3(0, 0, 0) },
  channel: { value: 1 },
  clipping: { value: false },
  clipPlane: { value: new Matrix4() },
  dim: { value: 1.0 },
  intensity: { value: 1.0 },
  slice: { value: 1.0 },
  step_size: { value: new Vector3(1, 1, 1) },
  u_data: { value: null },
  u_lut: { value: null },
  useLut: { value: true },
  viewPort: { value: new Vector2() },
  zScale: { value: 1.0 },
};

const DEFAULT_MATERIAL = {
  uniforms: DEFAULT_UNIFORMS,
  transparent: true,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: BackSide, // Shader uses "backface" as its reference point
};

export {
  ColorMaps,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
  DECIMALS,
  CANVAS_PADDING,
  HOVER_RADIUS,
  DEFAULT_UNIFORMS,
  DEFAULT_MATERIAL,
};
