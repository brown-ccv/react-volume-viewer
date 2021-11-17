import React from "react";
import PropTypes from "prop-types";

import App from "./components/App.jsx";

function VolumeViewer(props) {
  return <App {...props} />;
}

// TODO: String validation for position, rotation, scale
VolumeViewer.propTypes = {
  /** The current color map (path to the image) */
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
   * Minimum and maximum values of the model's dataset 
   * Min and max values are required
  */
  modelRange: PropTypes.exact({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    unit: PropTypes.string,
  }),

  /** Path to the model REQUIRED */
  modelPath: PropTypes.string.isRequired,

  /** Position of the model in the scene */
  modelPosition: PropTypes.string,

  /** Position of the model in the scene */
  modelRotation: PropTypes.string,

  /** Scale of the model in the scene */
  modelScale: PropTypes.string,

  /** Number of slices used to generate's the model */
  modelSlices: PropTypes.number,

  /** Spacing between the slices of the model */
  modelSpacing: PropTypes.exact({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),

  /** 
   * Whether or not to use the libraries default color maps 
   * Default Color Maps: Grayscale, Natural, RGB
  */
  useDefaultColorMaps: PropTypes.bool,
  
  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
};

VolumeViewer.defaultProps = {
  colorMap: null,
  colorMaps: {},
  controlsVisible: true,
  transferFunction: [
    { x: 0, y: 0 },
    { x: 0.11739130434782609, y: 0.11739130434782609 },
    { x: 0.34782608695652173, y: 0.34782608695652173 },
    { x: 1, y: 1 },
  ],

  modelRange: { min: 0, max: 1, unit: "" },
  modelPosition: "0 0 0",
  modelRotation: "0 0 0",
  modelScale: "1 1 1",
  modelSlices: 55,
  modelSpacing: { x: 2, y: 2, z: 1 },
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export { VolumeViewer };
