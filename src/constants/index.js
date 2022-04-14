import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

// TODO: Use Typescript to create custom types (Blending, ColorMap, Model, Point)

/** ENUM */

/**
 * Blending enum exposed to the user
 *  None: Don't apply any blending
 *  Add: Apply additive blending
 */
const Blending = {
  None: 0,
  Add: 1,
};

/** EXAMPLES */

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

export {
  Blending,
  COLOR_MAPS,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
};
