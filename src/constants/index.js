import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

/** Default Props */

// Blending enum exposed to the user
class Blending {
  static None = new Blending("None", 0);
  static Add = new Blending("Add", 1);

  constructor(name, blending) {
    this.name = name;
    this.blending = blending;
  }
  toString() {
    return `Blending.${this.name}`;
  }
}

/**
 * Object containing the name and path to a color map image
 * Grayscale, Natural, and Rgb are defaults
 *  name: Common name of the color map
 *  path: Path to the color map source image
 */
class ColorMap {
  static Grayscale = new ColorMap("Grayscale", grayscale);
  static Natural = new ColorMap("Natural", natural);
  static Rgb = new ColorMap("RGB", rgb);
  static all = [this.Grayscale, this.Natural, this.Rgb];

  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
  toString() {
    return `ColorMaps.${this.name}: ${this.path}`;
  }
}

const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

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

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

const DEFAULT_POSITION = "0 0 0";
const DEFAULT_ROTATION = "0 0 0";
const DEFAULT_SCALE = "1 1 1";

const DECIMALS = 2;
const CANVAS_PADDING = 10;
const HOVER_RADIUS = 15;

export {
  ColorMap,
  Blending,
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
};
