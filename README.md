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

## VolumeViewer

### Props

The only required props are the model's path and it's minimum and maximum data points. The model's path should be imported into the project and passed in from there - see the [example](#example) project.

CSS styling for the height must be provided and a custom width can be provided as well. The styling can be passed in through classes or inline styles.

```jsx
/**
 * Object containing the name and path to a color map image
 *  name: Common name of the color map
 *  path: Path to the color map source image
 */
const COLOR_MAP = PropTypes.exact({
  name: PropTypes.string,
  path: PropTypes.string,
});

/** The model to be displayed and it's related information */
const MODEL = PropTypes.shape({
  /**
   * The current color map applied to the model
   * The colorMap must be present in the colorMaps array
   * REQUIRED
   */
  colorMap: COLOR_MAP.isRequired,

  /** Array of color maps available in the controls. */
  colorMaps: PropTypes.arrayOf(COLOR_MAP),

  /** Channel to load data from (R:1, G:2, B:3)*/
  channel: PropTypes.number,

  /** Short description of the model */
  description: PropTypes.string,

  /** Flag to display the model */
  enabled: PropTypes.bool,

  /** Increase/decrease voxels intensity */
  intensity: PropTypes.number,

  /** Path to the model REQUIRED */
  path: PropTypes.string.isRequired,

  /** Minimum and maximum values of the model's dataset. */
  range: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    unit: PropTypes.string,
  }),

  /** Number of slices used to generate the model */
  slices: PropTypes.number,

  /** Spacing between the slices of the model */
  spacing: PropTypes.exact({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),

  /**
   * The transfer function applied to the color map
   * Array of 2D points
   */
  transferFunction: PropTypes.arrayOf(
    PropTypes.exact({
      x: PropTypes.number,
      y: PropTypes.number,
    })
  ),

  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
});

/**
 * Array of exactly two values between 0 and 1. slider[0] must be <= slider[1]
 *  slider[0]: Minimum slider value
 *  slider[1]: Maximum slider value
 */
 const SLIDER = /* Validation Function */

VolumeViewer.propTypes = {
  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED */
  models: PropTypes.arrayOf(MODEL).isRequired,

  // TODO CUSTOM STRING VALIDATION ON position, rotation, scale

  /** Position of the dataset in the scene */
  position: PropTypes.string,

  /** Position of the dataset in the scene */
  rotation: PropTypes.string,

  /** Scale of the dataset in the scene */
  scale: PropTypes.string,

  /* Sliders for control of clipping along the x, y, and z axes */
  sliders: PropTypes.exact({
    x: SLIDER,
    y: SLIDER,
    z: SLIDER,
  }),
};
```

### Default Props

The `DEFAULT_MODEL` object will be merged with every `model` in the `models` array. Note, however, that there is no default value for `models`.

```jsx
VolumeViewer.defaultProps = {
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

const DEFAULT_MODEL = {
  channel: 1,
  description: "",
  enabled: true,
  intensity: 1.0,
  range: { min: 0, max: 1, unit: "" },
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useTransferFunction: true,
};

```

## ColorMaps

The `ColorMaps` export is an object containing some default color maps that may be useful for your project. There is a grayscale, natural, and rgb color map:

<img alt="grayscale" src="./src/images/grayscale.png" height="25"/>
<img alt="natural" src="./src/images/natural.png" height="25"/>
<img alt="rgb" src="./src/images/rgb.png" height="25"/>

## Example

```jsx
import React from 'react'
import styled from 'styled-components'
import { VolumeViewer, ColorMaps } from "react-volume-viewer";

import model1 from "./path/to/model.png";
import model2 from "./path/to/model.png";

const haline = { name: "Haline", path: "path/to/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "path/to/colormaps/thermal.png" };

function App() {
  const [controlsVisible, setControlsVisible] = React.useState(true);

  return (
    <StyledVolumeViewer
      colorMaps={[haline, thermal, ColorMaps.grayscale]}
      controlsVisible={controlsVisible}
      models={[
        {
          name: "Salt",
          colorMap: haline,
          description: "Model visualizing salinity data",
          range: {
            min: 0.05,
            max: 33.71,
          },
          path: model1,
          scale: "1 -1 1",
          rotation: "-55 0 0",
        },
        {
          name: "Temperature",
          colorMap: thermal,
          enabled: false,
          description: "Model visualizing temperature data",
          range: {
            min: 0.05,
            max: 42,
            unit: "°C",
          },
          path: model2,
          scale: "1 -1 1",
          rotation: "-55 0 0",
        },
      ]}
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
