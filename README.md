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

The only required props are the model's path and it's minimum and maximum data points. The model's path should be imported into the project and passed in from there - see the [example](#example) project.

```jsx
VolumeViewer.propTypes = {
  /** The current color map (path to the image). It will default to grayscale if no colorMap is provided. */
  colorMap: PropTypes.string,
  /**
   * Dictionary of color maps available in the controls.
   *  key: Name of the color map
   *  value: Path to the color map
   */
  colorMaps: PropTypes.shape({
    Example: PropTypes.string,
  }),
  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,
  /** The model to be displayed and it's related information */
  model: PropTypes.shape({
    /** Path to the model REQUIRED */
    path: PropTypes.string.isRequired,
    /** Position of the model in the scene */
    position: PropTypes.string,
    /** Minimum and maximum values of the model's dataset. Min and max values are required */
    range: PropTypes.exact({
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
  /**
   * Whether or not to use the libraries default color maps
   * Default Color Maps: grayscale, natural, rgb
   * 
   * If defaultColorMaps is false and no colorMap is present the model will use grayscale
   */
  useDefaultColorMaps: PropTypes.bool,
  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
```

### Default Props

The default values of `model`'s properties will be passed in for all properties not explicitly set by the `model` prop passed in.

```jsx
VolumeViewer.defaultProps = {
  colorMap: null,
  colorMaps: {},
  controlsVisible: true,
  model: {
    position: "0 0 0",
    range: { min: 0, max: 1, unit: "" },
    rotation: "0 0 0",
    scale: "1 1 1",
    slices: 55,
    spacing: { x: 2, y: 2, z: 1 },
  }
  transferFunction: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

```

## Example

```jsx
import React from 'react'
import VolumeViewer from 'react-volume-viewer'

import haline from "./path/to/colormap/haline.png";
import model from "./path/to/model.png";

export default function App() {
  const [controlsVisible, setControlsVisible] = React.useState(true);

  return (
    <VolumeViewer
      colorMaps={{ Haline: haline }}
      colorMap={haline}
      controlsVisible={controlsVisible}
      model={{
        range: { min: 0.05, max: 33.71, unit: "°C" },
        path: model,
        scale: "1 -1 1",
        rotation: "-55 0 0",
      }}
      useDefaultColorMaps={false}
    />
  )
}
```

## License

MIT © [brown-ccv](https://github.com/brown-ccv)
