import { Blending, ColorMap, Point } from "../classes";
import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

/** DEFAULT VALUES */

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_TRANSFER_FUNCTION = [new Point(0, 0), new Point(1, 1)];
const DEFAULT_COLOR_MAPS = [
  new ColorMap("Grayscale", grayscale),
  new ColorMap("Natural", natural),
  new ColorMap("RGB", rgb),
];

/** DEFAULT PROPS */

const DEFAULT_MODEL = {
  blending: Blending.None,
  description: "",
  enabled: true,
  intensity: 1.0,
  range: { min: 0, max: 1, unit: "" },
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useTransferFunction: true,
  useColorMap: true,
};

const DEFAULT_POSITION = "0 0 0";
const DEFAULT_ROTATION = "0 0 0";
const DEFAULT_SCALE = "1 1 1";
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

export {
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_COLOR_MAPS,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
};
