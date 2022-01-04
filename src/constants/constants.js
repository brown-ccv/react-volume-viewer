import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

/** Default Props */

const DEFAULT_COLOR_MAPS = { grayscale, natural, rgb };

const DEFAULT_COLOR_MAP = grayscale;

const DEFAULT_MODEL = {
  position: "0 0 0",
  range: { min: 0, max: 1, unit: "" },
  rotation: "0 0 0",
  scale: "1 1 1",
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
};

const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

/** Controls */

const SLIDER_RANGE = { min: 0, max: 1 };
const DECIMALS = 2;
const CANVAS_PADDING = 10;
const HOVER_RADIUS = 15;

export {
  DEFAULT_COLOR_MAPS,
  DEFAULT_COLOR_MAP,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
  DECIMALS,
  CANVAS_PADDING,
  HOVER_RADIUS,
};
