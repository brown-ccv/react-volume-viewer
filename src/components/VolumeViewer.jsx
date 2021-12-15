import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import {
  DEFAULT_COLOR_MAP,
  DEFAULT_COLOR_MAPS,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  SLIDER_RANGE,
} from "../constants/constants";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

function VolumeViewer({
  className,
  style,
  colorMap,
  colorMaps,
  controlsVisible,
  model,
  transferFunction,
  useDefaultColorMaps,
  useTransferFunction,
}) {
  function getColorMap() {
    // colorMap is passed in colorMap
    // If no colorMap -> first property of colorMaps
    // If no colorMap and no colorMaps -> DEFAULT_COLOR_MAP

    // Return colorMap if given
    if (colorMap) return colorMap;

    const out = colorMaps
      ? colorMaps[Object.keys(colorMaps)[0]]
      : DEFAULT_COLOR_MAP;
    console.log("getColorMap", colorMaps, colorMap, out);
    return out;
  }
  function getModel() {
    const range = model.range ?? DEFAULT_MODEL.range;
    range.mid = (range.min + range.max) / 2;
    return {
      ...DEFAULT_MODEL,
      ...model,
      range: range,
    };
  }
  function getTransferFunction() {
    return useTransferFunction ? transferFunction : DEFAULT_TRANSFER_FUNCTION;
  }
  function getColorMaps() {
    const cMap = getColorMap();
    let out = useDefaultColorMaps
      ? { ...colorMaps, ...DEFAULT_COLOR_MAPS }
      : colorMaps;

    // If cMap not in out, add it

    return out;
  }

  const [state, setState] = useState({
    colorMap: getColorMap(),
    model: getModel(),
    sliders: {
      x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
    },
    transferFunction: getTransferFunction(),
  });

  // Update colorMap on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      colorMap: getColorMap(),
    }));
  }, [colorMap]);

  // Update model on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      model: getModel(),
    }));
  }, [model]);

  // Update transferFunction on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      transferFunction: getTransferFunction(),
    }));
  }, [transferFunction, useTransferFunction]);

  return (
    <Wrapper className={className} style={style}>
      <AframeScene state={state} useTransferFunction={useTransferFunction} />

      {controlsVisible && (
        <Controls
          state={state}
          setState={setState}
          colorMaps={getColorMaps()}
          initColorMap={getColorMap()}
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
   */
  useDefaultColorMaps: PropTypes.bool,

  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
};

// TODO: Should be able to set DEFAULT_COLOR_MAP here
VolumeViewer.defaultProps = {
  // colorMap: DEFAULT_COLOR_MAP,
  // colorMaps: {},
  controlsVisible: true,
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export default VolumeViewer;
