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

function VolumeViewer({
  className,
  style,
  colorMap: colorMapProp,
  colorMaps: colorMapsProp,
  controlsVisible,
  model: modelProp,
  transferFunction: transferFunctionProp,
  useDefaultColorMaps,
  useTransferFunction,
}) {
  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we
  // need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  // Control colorMap in state and update on prop change
  const getColorMap = useCallback(() => {
    return colorMapProp ?? DEFAULT_COLOR_MAP;
  }, [colorMapProp]);
  const [colorMap, setColorMap] = useState(getColorMap());
  useEffect(() => {
    setColorMap(getColorMap());
  }, [colorMapProp, getColorMap]);

  // Control colorMaps in state and update on prop change
  const getColorMaps = useCallback(() => {
    const colorMap = getColorMap();
    const colorMaps = useDefaultColorMaps
      ? colorMapsProp.concat(DEFAULT_COLOR_MAPS)
      : colorMapsProp;
    if (colorMaps.indexOf(colorMap) < 0) colorMaps.unshift(colorMap);

    return colorMaps;
  }, [useDefaultColorMaps, colorMapsProp, getColorMap])
  const [colorMaps, setColorMaps] = useState(getColorMaps())
  useEffect(() => {
    setColorMaps(getColorMaps())
  }, [colorMapProp, colorMapsProp, useDefaultColorMaps, getColorMaps])

  // Control model in state and update on prop change
  const getModel = useCallback(() => {
    return { ...DEFAULT_MODEL, ...modelProp };
  }, [modelProp]);
  const [model, setModel] = useState(getModel());
  useEffect(() => {
    setModel(getModel());
  }, [modelProp, getModel]);

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
          useTransferFunction={useTransferFunction}
          initColorMap={getColorMap()}
          initTransferFunction={getTransferFunction()}
          model={model}
          colorMaps={colorMaps}
          colorMap={colorMap}
          setColorMap={setColorMap}
          transferFunction={transferFunction}
          setTransferFunction={setTransferFunction}
          sliders={sliders}
          setSliders={setSliders}
          reset={() => {
            setColorMap(getColorMap());
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
`;

VolumeViewer.propTypes = {
  /**
   * The current color map applied by the transferFunction
   * It will default to the first object in colorMaps if no colorMap is provided
   * It will default to grayscale if neither colorMap nor colorMaps is provided.
   *
   *  name: Common name of the color map - used internally
   *  path: Path to the color map src
   */
  colorMap: PropTypes.exact({
    name: PropTypes.string,
    path: PropTypes.string,
  }),

  /**
   * Array of color maps available in the controls.
   *  name: Common name of the color map - used internally
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
  colorMaps: [],
  controlsVisible: true,
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useDefaultColorMaps: true,
  useTransferFunction: true,
};

export default VolumeViewer;
