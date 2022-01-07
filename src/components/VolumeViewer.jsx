import React, { useState, useEffect, useCallback } from "react";
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

const getColorMap = (colorMapProp) => {
  return colorMapProp ?? DEFAULT_COLOR_MAP;
};

function VolumeViewer({
  className,
  style,
  colorMap: colorMapProp,
  colorMaps,
  controlsVisible,
  model: modelProp,
  transferFunction: transferFunctionProp,
  useDefaultColorMaps,
  useTransferFunction,
}) {
  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  // Control colorMap in state and update on prop change
  const [colorMap, setColorMap] = useState(getColorMap(colorMapProp));
  useEffect(() => {
    setColorMap(getColorMap(colorMapProp));
  }, [colorMapProp]);

  // Control transferFunction in state and update on prop change
  const getTransferFunction = useCallback(() => {
    return useTransferFunction
      ? transferFunctionProp
      : DEFAULT_TRANSFER_FUNCTION;
  }, [useTransferFunction, transferFunctionProp]);
  const [transferFunction, setTransferFunction] = useState(
    getTransferFunction()
  );
  useEffect(() => {
    setTransferFunction(getTransferFunction());
  }, [transferFunctionProp, useTransferFunction, getTransferFunction]);

  // Update model on prop change
  const getModel = useCallback(() => {
    return { ...DEFAULT_MODEL, ...modelProp };
  }, [modelProp]);
  const model = getModel();

  // Control sliders in state, sliders isn't exposed as a prop
  const [sliders, setSliders] = useState({
    x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
    y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
    z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
  });

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene
        model={model}
        colorMap={colorMap}
        transferFunction={transferFunction}
        useTransferFunction={useTransferFunction}
        sliders={sliders}
      />

      {controlsVisible && (
        <Controls
          colorMaps={
            useDefaultColorMaps
              ? { ...colorMaps, ...DEFAULT_COLOR_MAPS }
              : colorMaps
          }
          useTransferFunction={useTransferFunction}
          initColorMap={getColorMap(colorMapProp)}
          initTransferFunction={getTransferFunction()}
          model={model}
          colorMap={colorMap}
          setColorMap={setColorMap}
          transferFunction={transferFunction}
          setTransferFunction={setTransferFunction}
          sliders={sliders}
          setSliders={setSliders}
          reset={() => {
            setColorMap(getColorMap(colorMapProp));
            setSliders({
              x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
              y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
              z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
            });
            setTransferFunction(getTransferFunction());
            setRemountKey(Math.random());
          }}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
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
   * If defaultColorMaps is false and no colorMap is present the model will use grayscale
   */
  useDefaultColorMaps: PropTypes.bool,

  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
};

VolumeViewer.defaultProps = {
  colorMap: DEFAULT_COLOR_MAP,
  controlsVisible: true,
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export default VolumeViewer;
