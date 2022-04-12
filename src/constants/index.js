import { ColorMap } from "../classes";

/** DEFAULT VALUES */

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_COLOR_MAPS = [ColorMap.Grayscale, ColorMap.Natural, ColorMap.Rgb];

const DEFAULT_POSITION = "0 0 0";
const DEFAULT_ROTATION = "0 0 0";
const DEFAULT_SCALE = "1 1 1";
const DEFAULT_SLIDERS = {
  x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
};

export {
  DEFAULT_COLOR_MAPS,
  SLIDER_RANGE,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
};
