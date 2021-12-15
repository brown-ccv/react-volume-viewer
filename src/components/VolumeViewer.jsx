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
  // colorMap is first property of colorMaps if no colorMap
  // or DEFAULT_COLOR_MAP if no colorMap or colorMaps
  function getColorMap() {
    if (colorMap) return colorMap;

    if (Object.keys(colorMaps).length > 1)
      return colorMaps[Object.keys(colorMaps)[0]];
    else return DEFAULT_COLOR_MAP;
  }

  // Add a midpoint to the model's range
  function getModel() {
    const range = model.range ?? DEFAULT_MODEL.range;
    range.mid = (range.min + range.max) / 2;
    return {
      ...DEFAULT_MODEL,
      ...model,
      range: range,
    };
  }

  // Use DEFAULT if !useTransferFunction
  // Note that transferFunction defaults to DEFAULT_TRANSFER_FUNCTION if not passed in
  function getTransferFunction() {
    return useTransferFunction ? transferFunction : DEFAULT_TRANSFER_FUNCTION;
  }

  // Conditionally add DEFAULT_COLOR_MAPS and make sure colorMap is in colorMaps
  function getColorMaps() {
    const colorMap = getColorMap();
    return {
      ...(Object.values(colorMaps).indexOf(colorMap) < 0 && {
        colorMap: colorMap,
      }),
      ...colorMaps,
      ...(useDefaultColorMaps && DEFAULT_COLOR_MAPS),
    };
  }

  const [state, setState] = useState({
    colorMap: getColorMap(),
    colorMaps: getColorMaps(),
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
  }, [colorMap, colorMaps]);

  // Update colorMaps on prop change
  useEffect(() => {
    setState((state) => ({
      ...state,
      colorMaps: getColorMaps(),
    }));
  }, [colorMap, colorMaps, useDefaultColorMaps]);

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

VolumeViewer.defaultProps = {
  colorMaps: {},
  controlsVisible: true,
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export default VolumeViewer;
