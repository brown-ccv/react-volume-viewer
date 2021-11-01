import React from "react";
import PropTypes from "prop-types";

import { VolumeViewerProvider } from "./context/context";
import App from "./components/App.jsx";

// TODO: HANDLE PROPS & EXCEPTIONS HERE
// TODO: Expect a path, return null if empty
function VolumeViewer(props) {
  const { path } = props;

  return (
    <VolumeViewerProvider>
      <App {...props} />
    </VolumeViewerProvider>
  );
}

// const {
//   controlsVisible = true, // Whether or not the controls can be seen
//   useTransferFunction = true, // Whether or not to color the model with the transfer function
//   initTransferFunction, // The initial transfer function (pass to change default in context)
//   useDefaultColorMaps = true, // Whether or not to use the package's default color maps
//   colorMaps = [], // Additional color maps
//   colorMap, // The current color map (pass to change without using controls)

//   // Model Information
//   path, // Path to the model (REQUIRED)
//   slices = 55, // Number of slices in the png
//   spacing = { x: 2, y: 2, z: 1 }, // Spacing of the slices, consolidated into 1 object
//   position = "0 0 0", // Position of the model
//   rotation = "0 0 0", // Rotation of the model, default isn't the rotation of the RIDDC models
//   scale = "1 1 1", // Scale of the models, default isn't the scale of the RIDDC models
//   dataRange = { min: 0, max: 1, unit: "" }, // Data points used in OpacityControls.js from unmerged branch
// } = props;

VolumeViewer.propTypes = {
  path: PropTypes.string,
};

VolumeViewer.defaultProps = {
  colorMaps: [
    { name: "Grayscale", src: "images/grayscale.png" },
    { name: "Natural", src: "images/natural.png" },
    { name: "RGB", src: "images/rgb.png" },
  ],
  initialTransferFunction: [
    { x: 0, y: 0 },
    { x: 0.11739130434782609, y: 0.11739130434782609 },
    { x: 0.34782608695652173, y: 0.34782608695652173 },
    { x: 1, y: 1 },
  ],
  path: null,
  range: { min: 0, max: 1 },
};

export { VolumeViewer };
