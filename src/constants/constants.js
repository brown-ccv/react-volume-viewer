import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

/** Default Props */

const grayscaleColorMap = { name: "Grayscale", path: grayscale };
const DEFAULT_COLOR_MAPS = [
  grayscaleColorMap,
  { name: "Natural", path: natural },
  { name: "RGB", path: rgb },
];

const DEFAULT_COLOR_MAP = grayscaleColorMap;

const DEFAULT_MODEL = {
  channel: 1,
  intensity: 1.0,
  position: "0 0 0",
  range: { min: 0, max: 1, unit: "" },
  rotation: "0 0 0",
  scale: "1 1 1",
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
  useTransferFunction: true,
};

const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

const DECIMALS = 2;
const CANVAS_PADDING = 10;
const HOVER_RADIUS = 15;

export {
  DEFAULT_COLOR_MAPS,
  DEFAULT_COLOR_MAP,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DECIMALS,
  CANVAS_PADDING,
  HOVER_RADIUS,
};
