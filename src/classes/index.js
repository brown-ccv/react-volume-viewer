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

export { ColorMap, Blending, Point };
