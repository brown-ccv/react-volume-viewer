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
VolumeViewer.propTypes = {
  /**
   * Array of color maps available in the controls.
   *  name: Common name of the color map
   *  path: Path to the color map src
   */
  colorMaps: PropTypes.arrayOf(
    PropTypes.exact({
      name: PropTypes.string,
      path: PropTypes.string,
    })
  ),

  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** The model to be displayed and it's related information */
  model: PropTypes.shape({
    /** Common name of the color map applied by the transfer function. REQUIRED */
    colorMap: PropTypes.string.isRequired,

    /** Channel to load data from (R:1, G:2, B:3)*/
    channel: PropTypes.number,

    /** Increase/decrease voxels intensity */
    intensity: PropTypes.number,

    /** Path to the model REQUIRED */
    path: PropTypes.string.isRequired,

    /** Position of the model in the scene */
    position: PropTypes.string,

    /** Minimum and maximum values of the model's dataset. Min and max values are required */
    range: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      unit: PropTypes.string,
    }),

    /** Position of the model in the scene */
    rotation: PropTypes.string,

    /** Scale of the model in the scene */
    scale: PropTypes.string,

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
  }),
};
```

### Default Props

The default values of `model`'s properties will be passed in for all properties not explicitly set by the `model` prop passed in.

```jsx
VolumeViewer.defaultProps = {
  colorMaps: [],
  controlsVisible: false,
  model: {
    colorMap: null,
    position: "0 0 0",
    range: { min: 0, max: 1, unit: "" },
    rotation: "0 0 0",
    scale: "1 1 1",
    slices: 55,
    spacing: { x: 2, y: 2, z: 1 },
    transferFunction: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    useTransferFunction: true,
  }
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

const haline = { name: "Haline", path: "./path/to/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "./path/to/colormaps/thermal.png" };
import model from "./path/to/model.png";

function App() {
  const [controlsVisible, setControlsVisible] = React.useState(true);

  return (
    <StyledVolumeViewer
      colorMaps={[haline, thermal, ColorMaps.grayscale]}
      colorMap={haline.name}
      controlsVisible={controlsVisible}
      model={{
        colorMap={haline},
        range: { min: 0.05, max: 33.71, unit: "°C" },
        path: model,
        scale: "1 -1 1",
        rotation: "-55 0 0",
      }}
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
