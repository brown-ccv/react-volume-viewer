import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

/** Classes and Enums */

// Blending enum exposed to the user
/**
 * Blending enum exposed to the user
 *  None: Don't apply any blending
 *  Add: Apply additive blending
 */
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

/**
 * (x, y) coordinates for the transfer function. Values must be between 0 and 1
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `Point: {x: ${this.x}, y: ${this.y}}`;
  }
  validate() {
    if (this.x < 0 || this.x > 1)
      throw new Error(
        `Error: Point.x in ${this.toString()} out of range. ` +
          `Coordinates must be between 0 and 1 (inclusive)`
      );

    if (this.y < 0 || this.y > 1)
      throw new Error(
        `Error: Point.y in ${this.toString()} out of range. ` +
          `Coordinates must be between 0 and 1 (inclusive)`
      );
  }
}

/** DEFAULT VALUES */

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_TRANSFER_FUNCTION = [new Point(0, 0), new Point(1, 1)];


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
  ColorMap,
  Blending,
  Point,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
};
