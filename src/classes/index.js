import grayscale from "../images/grayscale.png";
import natural from "../images/natural.png";
import rgb from "../images/rgb.png";

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

  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
  toString() {
    return `ColorMaps.${this.name}: ${this.path}`;
  }
}

/**
 * (x, y) coordinates for the transfer function.
 * Values must be between 0 and 1
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

/**
 * Object containing information about a single model
 *  colorMap: The color map applied to the model.
 *  colorMaps: Array of possible color maps for the model
 *    this.colorMap must be present in this.colorMaps
 *  description: Short description of the model
 *  enabled: Flag to display the model
 *  intensity: Multiplication factor for voxels intensity
 *  name: Unique name given to the model
 *  path: Path to the model
 *  range: Minimum and maximum values of the model's dataset
 *  transferFunction: The transfer function applied to the color map
 *  initTransferFunction: Initial value of transfer function applied to the color map
 *  useTransferFunction: Flag to apply a transfer function to the model
 *  useColorMap: Flag to apply a color map to the model
 */
class Model {
  static Default = new Model({
    blending: Blending.None,
    colorMaps: [],
    enabled: true,
    intensity: 1,
    range: { min: 0, max: 1, unit: "" },
    transferFunction: [new Point(0, 0), new Point(1, 1)],
    useTransferFunction: true,
    useColorMap: true,
  });

  // Merge passed in object with Model.Default
  constructor(obj) {
    this.blending = obj.blending ?? Model.Default.blending;
    this.colorMap = obj.colorMap;
    this.colorMaps = obj.colorMaps ?? Model.Default.colorMaps;
    this.description = obj.description;
    this.enabled = obj.enabled ?? Model.Default.enabled;
    this.intensity = obj.intensity ?? Model.Default.intensity;
    this.name = obj.name;
    this.path = obj.path;
    this.range = obj.range ?? Model.Default.range;
    this.transferFunction =
      obj.transferFunction ?? Model.Default.transferFunction;
    this.initTransferFunction =
      obj.transferFunction ?? Model.Default.transferFunction;
    this.useTransferFunction =
      obj.useTransferFunction ?? Model.Default.useTransferFunction;
    this.useColorMap = obj.useColorMap ?? Model.Default.useColorMap;

    if (!this.useTransferFunction) {
      // TODO: Return to model defaults
      // transferFunction is (0,1), (1,1)?
    }

    if (!this.useColorMap) {
      // TODO: Return to model defaults
    }
  }
  toString() {
    return `Model.${this.name}: ${this.path}`;
  }
  validate() {
    // Validate points along the transferFunction
    this.transferFunction.forEach((point) => point.validate());

    if (!this.colorMaps.includes(this.colorMap))
      throw new Error("Color Map '" + this.colorMap + "' not in colorMaps");

    if (this.useColorMap) {
      // TODO "colorMap" is required unless !useColorMap
    }

    if (this.useTransferFunction) {
      // TODO "transferFunction is required unless !useColorMap"
    }

    // Color map names in colorMaps must be unique
    const colorMapNames = new Set();
    this.colorMaps.forEach((colorMap) => {
      if (colorMapNames.has(colorMap.name))
        throw new Error(
          "Color map name '" +
            colorMap.name +
            "' is not unique on model '" +
            this.name +
            "'"
        );
      else colorMapNames.add(colorMap.name);
    });
  }
}

export { ColorMap, Blending, Model, Point };
