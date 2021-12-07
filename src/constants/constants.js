import grayscale from "../assets/grayscale.png";
import natural from "../assets/natural.png";
import rgb from "../assets/rgb.png";

const DEFAULT_COLOR_MAPS = {
  Grayscale: grayscale,
  Natural: natural,
  RGB: rgb,
};

const DEFAULT_MODEL = {
  position: "0 0 0",
  range: { min: 0, mid: 0.5, max: 1, unit: "" },
  rotation: "0 0 0",
  scale: "1 1 1",
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
};

const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

const SLIDER_RANGE = { min: 0, max: 1 };

export {
  DEFAULT_COLOR_MAPS,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
};
