# react-volume-viewer

> Aframe container with custom controls for use in react applications

[![NPM](https://img.shields.io/npm/v/react-volume-viewer.svg)](https://www.npmjs.com/package/react-volume-viewer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Development

Clone repo and run `npm install`

Run `npm start` in one terminal and `cd example && npm start` in a second terminal. The first terminal will detect changes in the library and the second will deploy the example on [http://localhost:3000](http://localhost:3000)

## Install

```bash
npm install react-volume-viewer
```

## Props

The only required props are the model's path, colorMap, and it's minimum and maximum data points. The model's path should be imported into the project and passed in from there - see the [example](#example) project.

CSS styling for the height must be provided and a custom width can be provided as well. The styling can be passed in through classes or inline styles.

```jsx

VolumeViewer.propTypes = {
  /** Blending algorithm to apply between the models
   *    Blending.None: Don't apply blending
   *    Blending.Add: Apply additive blending
   */
  blending: PropTypes.instanceOf(Blending),

  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED
   *  Each MODEL is of class Model
   *    colorMap: The color map applied to the model.
   *      colorMap is an instance of ColorMap
   *    colorMaps: Array of possible color maps for the model
   *      colorMap must be present in colorMaps
   *      Each colorMap must have a unique name in colorMaps
   *    description: Short description of the model
   *    enabled: Flag to display the model
   *    intensity: Multiplication factor for voxels intensity
   *    name: Unique name given to the model
   *    path: Path to the model
   *    range: Minimum and maximum values of the model's dataset
   *    transferFunction: The transfer function applied to the color map
   *      transferFunction is an array of Point classes
   *      Each point in transferFunction must be between (0, 0) and (1,1)
   *    initTransferFunction: Initial value of transfer function applied to the color map
   *    useTransferFunction: Flag to apply a transfer function to the model
   *    useColorMap: Flag to apply a color map to the model
   */
  models: MODEL,

  /** Position of the dataset in the scene as a "[x] [y] [z]" string
   *    [x], [y], and [z] must be valid numbers and are space separated
   */
  position: PropTypes.string,

  /** Position of the dataset in the scene as a "[x] [y] [z]" string
   *    [x], [y], and [z] must be valid numbers and are space separated
   */
  rotation: PropTypes.string,

  /** Scale of the dataset in the scene as a "[x] [y] [z]" string
   *    [x], [y], and [z] must be valid numbers and are space separated
   */
  scale: PropTypes.string,

  /** Number of slices used to generate the model REQUIRED 
   *    slices must be a valid integer
   */
  slices: PropTypes.number.isRequired,

  /** Spacing between the slices of the models a "[x] [y] [z]" string
   *    [x], [y], and [z] must be valid numbers and are space separated
   */
  spacing: PropTypes.string.isRequired,

  /** 
   * Sliders for control of clipping along the x, y, and z axes 
   * SLIDER is an array of exactly two values between 0 and 1. slider[0] <= slider[1].
   *  slider[0]: Minimum slider value
   *  slider[1]: Maximum slider value
   */
  sliders: PropTypes.exact({
    x: SLIDER,
    y: SLIDER,
    z: SLIDER,
  }),
};
```

## Default Props

The `Model.Default` object will be merged with every `model` in the `models` array. Note, however, that there is no default value for `colorMap`, `description`, `name`, or `path`. Each of these is required.

```jsx
VolumeViewer.defaultProps = {
  blending: Blending.Add,
  controlsVisible: false,
  position: "0 0 0",
  rotation: "0 0 0",
  scale: "1 1 1",
  sliders: {
    x: [0, 1],
    y: [0, 1],
    z: [0, 1],
  };,
};
```

The default model is merged with every `model` in the `models` array. Note, however, that there is no default value for `colorMap`, `name`, or `path`. Each of these is required.

```js
  {
    colorMaps: [],
    description: "",
    enabled: true,
    intensity: 1,
    range: { min: 0, max: 1, unit: "" },
    transferFunction: [new Point(0, 0), new Point(1, 1)],
    useTransferFunction: true,
    useColorMap: true,
  }
```

## Exports

### VolumeViewer

`<VolumeViewer />` is the main component exported by this library. It's expected props are detailed above.

## Blending

The `Blending` class is used as an enum for the different algorithms that can be used to blending the models together. `Blending.None` does not apply any blending. `Blending.Add` applies additive blending. Currently only `Blending.None` is implemented.

```js
class Blending {
  static None = new Blending("None", 0);
  static Add = new Blending("Add", 1);

  constructor(name, blending) {
    this.name = name;
    this.blending = blending;
  }
}
```

## Point

The `Point` class creates a simple (x, y) coordinate. It is validated to a coordinate space from (0, 0) to (1,1) inclusive.

```js
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
```

### Model

The `Model` class holds all of the properties for a single model. Certain default values are merged automatically in the constructor and the class comes with it's own validation. Note that you can use `Model.Default` when you are building your own `Model` instances.

```js
class Model {
  static Default = new Model({
    colorMaps: [],
    description: "",
    enabled: true,
    intensity: 1,
    range: { min: 0, max: 1, unit: "" },
    transferFunction: [new Point(0, 0), new Point(1, 1)],
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
  }
  toString() {
    return `Model.${this.name}: ${this.path}`;
  }
  validate() {
    // Validate points along the transferFunction
    this.transferFunction.forEach((point) => point.validate());

    if (!this.colorMaps.includes(this.colorMap))
      throw new Error("Color Map '" + this.colorMap + "' not in colorMaps");

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
```

### ColorMap

`ColorMap` is the class used to pass color map images into the component. It contains some default color maps that may be useful for your project. There is a grayscale, natural, and rgb color map:

<img alt="grayscale" src="./src/images/grayscale.png" height="25"/>
<img alt="natural" src="./src/images/natural.png" height="25"/>
<img alt="rgb" src="./src/images/rgb.png" height="25"/>

```js
class ColorMap {
  static Grayscale = new ColorMap("Grayscale", grayscale)
  static Natural = new ColorMap("Natural", natural)
  static Rgb = new ColorMap("RGB", rgb)
  static all = [this.Grayscale, this.Natural, this.Rgb]

  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
}
```

### DEFAULT_COLOR_MAPS

`DEFAULT_COLOR_MAPS` is an array of three example color maps. It can be imported into your project and passed into `model.colorMaps` for any individual model. Note that they can also be accessed through the ColorMap class directly.

```js
const DEFAULT_COLOR_MAPS = [ColorMap.Grayscale, ColorMap.Natural, ColorMap.Rgb];
```

### DEFAULT_SLIDERS

The `DEFAULT_SLIDERS` export is the default value for the `sliders` prop. It will be applied automatically if you do not pass `sliders` into `<VolumeViewer />`

```js
const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_SLIDERS = {
  x: [0, 1],
  y: [0, 1],
  z: [0, 1],
};
```

## Example

```jsx
import React from 'react'
import styled from 'styled-components'
import {
  VolumeViewer,
  ColorMap,
  Point,
  DEFAULT_COLOR_MAPS,
  Model,
} from "react-volume-viewer";

import model1 from "./path/to/model.png";
import model2 from "./path/to/model.png";

const haline = new ColorMap("Haline", "./assets/colormaps/haline.png")
const thermal = new ColorMap("Thermal", "./assets/colormaps/thermal.png")

function App() {
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const [enabled, setEnabled] = React.useState(true)

  return (
    <StyledVolumeViewer
      controlsVisible={controlsVisible}
      models={[
        new Model({
          name: "Salt",
          colorMap: haline,
          colorMaps={[haline, thermal, ...ColorMap.all]}
          description: "Model visualizing salinity data",
          range: {
            min: 0.05,
            max: 33.71,
          },
          path: model1,
          transferFunction: [new Point(0, 0), new Point(0.5, 0.5), new Point(1, 1)],
        }),
        new Model({
          name: "Temperature",
          colorMap: ColorMap.Grayscale,
          colorMaps={ColorMap.all}
          enabled: enabled,
          description: "Model visualizing temperature data",
          range: {
            min: 2.5,
            max: 42,
            unit: "°C",
          },
          useTransferFunction: false,
          useColorMap: false,
        }),
      ]}
      rotation: "-55 0 0"
      scale: "1 -1 1"
      slices={50}
      spacing="2 2 1"
          
    />
  )
}

const StyledVolumeViewer = styled(VolumeViewer)`
  height: 50vh;
`;

export default App
```

## License

MIT © [brown-ccv](https://github.com/brown-ccv)
