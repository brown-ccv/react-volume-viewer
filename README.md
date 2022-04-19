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

The only required props are the model's path, colorMap, and it's minimum and maximum data points. The model's path should be imported into the project and passed in from there - see the [example project](#example).

CSS styling for the height must be provided and a custom width can be provided as well. You can define your own class and/or pass inline styles into the `<VolumeViewer />` component to accomplish this.

```jsx

VolumeViewer.propTypes = {
  /**
   * Blending enum exposed to the user
   *  None: Don't apply any blending
   *  Add: Apply additive blending
   */
  blending: PropTypes.oneOf(Object.values(Blending)),

  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED
   *    colorMap: Object containing the path to the current color image applied to the model. REQUIRED
   *      name: Common name of the color map REQUIRED
   *      path: Path to the color map source image REQUIRED
   *    colorMaps: Array of possible color maps for the model
   *      colorMap must be present in colorMaps
   *      Each colorMap must have a unique name in colorMaps
   *    description: Short description of the model
   *    enabled: Flag to display the model
   *    intensity: Multiplication factor for voxels intensity
   *    name: Unique name given to the model REQUIRED
   *    path: Path to the model REQUIRED
   *    range: Minimum and maximum values of the model's dataset
   *    transferFunction: The transfer function applied to the color map
   *      Array of {x: <val>, y: <val>} coordinates.
   *      Each coordinate in transferFunction must be between (0, 0) and (1,1)
   *    useTransferFunction: Flag to apply a transfer function to the model
   *    useColorMap: Flag to apply a color map to the model
   */
  models: MODEL,

  /** Position of the dataset in the scene as a "<x> <y> <z>" string
   *    x, y, and z must be valid numbers and are space separated
   */
  position: PropTypes.string,

  /** Position of the dataset in the scene as a "<x> <y> <z>" string
   *    x, y, and z must be valid numbers and are space separated
   */
  rotation: PropTypes.string,

  /** Scale of the dataset in the scene as a "<x> <y> <z>" string
   *    x, y, and z must be valid numbers and are space separated
   */
  scale: PropTypes.string,

  /** Number of slices used to generate the model REQUIRED 
   *    slices must be a positive integer
   */
  slices: PropTypes.number.isRequired,

  /** Spacing between the slices of the models a "<x> <y> <z>" string REQUIRED
   *    x, y, and z must be valid numbers and are space separated
   */
  spacing: PropTypes.string.isRequired,

  /** 
   * Sliders for control of clipping along the x, y, and z axes 
   * SLIDER is an array of exactly two values between 0 and 1. slider[0] must be <= slider[1].
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
const Blending = {
  None: 0,
  Add: 1,
};
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

### COLOR_MAPS

`COLOR_MAPS` is an object containing some example colormaps. Any/all of the color maps can be imported into your project and passed into `model.colorMaps` array for any individual model.

<img alt="grayscale" src="./src/images/grayscale.png" height="25"/>
<img alt="natural" src="./src/images/natural.png" height="25"/>
<img alt="rgb" src="./src/images/rgb.png" height="25"/>

```js
const COLOR_MAPS = {
  Grayscale: {name: "Grayscale", path: grayscale},
  Natural: {name: "Natural", path: natural},
  Rgb: {name: "Rgb", path: rgb},
}
```

### DEFAULT_SLIDERS

The `DEFAULT_SLIDERS` export is the default value for the `sliders` prop. It will be applied automatically if you do not pass `sliders` into `<VolumeViewer />`.

```js
const DEFAULT_SLIDERS = {
  x: [0, 1],
  y: [0, 1],
  z: [0, 1],
};
```

### DEFAULT_MODEL

The `DEFAULT_MODEL` object contains default values for some properties of an individual model. These values are automatically merged with each object in the `models` prop passed in if any specific property is not given. Note that the `colorMap`, `name`, and `path` properties are not present as these are required properties.

```js
const DEFAULT_MODEL = {
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
}
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
