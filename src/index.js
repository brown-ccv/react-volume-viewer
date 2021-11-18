import PropTypes from "prop-types";

import VolumeViewer from "./components/VolumeViewer.jsx";

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
   * The model to be displayed
   */
  model: PropTypes.shape({
    path: PropTypes.string.isRequired /** Path to the model REQUIRED */,
    position: PropTypes.string /** Position of the model in the scene */,
    range: PropTypes.exact({
      /** Minimum and maximum values of the model's dataset. Min and max values are required */
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      unit: PropTypes.string,
    }),
    rotation: PropTypes.string /** Position of the model in the scene */,
    scale: PropTypes.string /** Scale of the model in the scene */,
    slices:
      PropTypes.number /** Number of slices used to generate's the model */,
    spacing: PropTypes.exact({
      /** Spacing between the slices of the model */ x: PropTypes.number,
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
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export { VolumeViewer };
