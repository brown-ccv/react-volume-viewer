import React from "react";
import PropTypes from "prop-types";

import App from "./components/App.jsx";

function VolumeViewer(props) {
  return <App {...props} />;
}

// TODO: String validation for position, rotation, scale
// TODO: Force user to pass min and max but not unit for dataRange?
// TODO: Combine model into a single object? - What happens when one property changes?
// TODO: ColorMap should be passed as a string, not the path itself - access width colorMaps[colorMap]
VolumeViewer.propTypes = {
  colorMap: PropTypes.string, // The current color map (import image and pass that)
  colorMaps: PropTypes.shape({
    Example: PropTypes.string, // Key is the name of the color map
  }), // Default Color Maps
  controlsVisible: PropTypes.bool, // Whether or not the controls can be seen
  initialTransferFunction: PropTypes.arrayOf(
    PropTypes.exact({
      x: PropTypes.number,
      y: PropTypes.number,
    })
  ), // The initial transfer function (pass to change default in context)

  modelRange: PropTypes.exact({
    min: PropTypes.number,
    max: PropTypes.number,
    unit: PropTypes.string,
  }), // Data points used in OpacityControls.js from unmerged branch
  modelPath: PropTypes.string.isRequired, // Path to the model (REQUIRED)
  modelPosition: PropTypes.string, // Position of the model
  modelPotation: PropTypes.string, // Rotation of the model, default isn't the rotation of the RIDDC models
  modelScale: PropTypes.string, // Scale of the models, default isn't the scale of the RIDDC models
  modelSlices: PropTypes.number, // Number of slices in the png
  modelSpacing: PropTypes.exact({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }), // Spacing of the slices, consolidated into 1 object

  useDefaultColorMaps: PropTypes.bool, // Whether or not to use the package's default color maps
  useTransferFunction: PropTypes.bool, // Whether or not to color the model with the transfer function
  
};

VolumeViewer.defaultProps = {
  colorMap: null,
  colorMaps: {},
  controlsVisible: true,
  initTransferFunction: [
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
