// class ColorMap {
//   static Grayscale = new ColorMap("Grayscale", grayscale);
//   static Natural = new ColorMap("Natural", natural);
//   static Rgb = new ColorMap("RGB", rgb);

//   constructor(name, path) {
//     this.name = name;
//     this.path = path;
//   }
//   toString() {
//     return `ColorMaps.${this.name}: ${this.path}`;
//   }
// }

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
    colorMaps: [],
    description: "",
    enabled: true,
    intensity: 1,
    range: { min: 0, max: 1, unit: "" },
    transferFunction: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
    useTransferFunction: true,
    useColorMap: true,
  });

  // Merge passed in object with Model.Default
  constructor(obj) {
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

      // Validate coordinates in transferFunction
      this.transferFunction.forEach((point) => {
        if (point.x === undefined || point.x < 0 || point.x > 1)
          throw new Error(
            `Error: ${point.x} in ${point} out of range. ` +
              `x coordinate must be between 0 and 1 (inclusive)`
          );

        if (point.y === undefined || point.y < 0 || point.y > 1)
          throw new Error(
            `Error: ${point.y} in ${point} out of range. ` +
              `y coordinate must be between 0 and 1 (inclusive)`
          );
      });
    });
  }
}

export { Model };
