import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import grayscale from "../assets/grayscale.png";
import natural from "../assets/natural.png";
import rgb from "../assets/rgb.png";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

const SLIDER_RANGE = { min: 0, max: 1 };
const DEFAULT_COLOR_MAPS = {
  Grayscale: grayscale,
  Natural: natural,
  RGB: rgb,
};
const DEFAULT_MODEL = {
  position: "0 0 0",
  range: { min: 0, max: 1, unit: "" },
  rotation: "0 0 0",
  scale: "1 1 1",
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
};
const DEFAULT_TRANSFER_FUNCTION = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

function VolumeViewer(props) {
  const {
    className,
    style,
    colorMap,
    colorMaps,
    controlsVisible,
    model,
    transferFunction,
    useDefaultColorMaps,
    useTransferFunction,
  } = props;

  const [state, setState] = useState({
    colorMap: colorMap,
    model: { ...DEFAULT_MODEL, ...model },
    sliders: {
      x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
    },
    transferFunction: useTransferFunction
      ? transferFunction
      : DEFAULT_TRANSFER_FUNCTION,
  });

  // Update colorMap on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      colorMap: colorMap,
    }));
  }, [colorMap]);

  // Update model on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      model: { ...DEFAULT_MODEL, ...model },
    }));
  }, [model]);

  // Update transferFunction on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      transferFunction: useTransferFunction
        ? transferFunction
        : DEFAULT_TRANSFER_FUNCTION,
    }));
  }, [transferFunction, useTransferFunction]);

  return (
    <Wrapper className={className} style={style}>
      <AframeScene state={state} useTransferFunction={useTransferFunction} />

      {controlsVisible && (
        <Controls
          state={state}
          setState={setState}
          colorMaps={
            useDefaultColorMaps
              ? { ...colorMaps, ...DEFAULT_COLOR_MAPS }
              : colorMaps
          }
          SLIDER_RANGE={SLIDER_RANGE}
          useTransferFunction={useTransferFunction}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
`;

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

export default VolumeViewer;
