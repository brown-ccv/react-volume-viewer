import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import {
  DEFAULT_COLOR_MAP,
  DEFAULT_COLOR_MAPS,
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_SLIDERS,
} from "../constants/constants";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

// Functions for handling prop input
// const getColorMap = (colorMapProp, colorMapsProp) => {
//   if (colorMapProp) return colorMapProp;
//   else if (colorMapsProp.length) return colorMapsProp[0];
//   else return DEFAULT_COLOR_MAP;
// };
const getColorMap = (colorMap, colorMapsProp) => {
  if (colorMap) return colorMap;
  else if (colorMapsProp.length) return colorMapsProp[0];
  else return DEFAULT_COLOR_MAP;
};
const getColorMaps = (colorMap, useDefaultColorMaps, colorMapsProp) => {
  const colorMaps = [...colorMapsProp]; // JS arrays pass by reference, need fresh copy
  if (useDefaultColorMaps) colorMaps.push(...DEFAULT_COLOR_MAPS);
  if (!colorMaps.includes(colorMap)) colorMaps.unshift(colorMap);
  return colorMaps;
};
const getTransferFunction = (useTransferFunction, transferFunctionProp) => {
  if (useTransferFunction) return transferFunctionProp;
  else return DEFAULT_TRANSFER_FUNCTION;
};

function VolumeViewer({
  className,
  style,
  // colorMap: colorMapProp,
  colorMaps: colorMapsProp,
  controlsVisible,
  model: modelProp,
  transferFunction: transferFunctionProp,
  useDefaultColorMaps,
}) {
  // Get initial values based on prop input. These will update on prop change
  const model = { ...DEFAULT_MODEL, ...modelProp };
  // const initColorMap = getColorMap(colorMapProp, colorMapsProp);
  const initColorMap = getColorMap(model.colorMap, colorMapsProp);
  const colorMaps = getColorMaps(
    initColorMap,
    useDefaultColorMaps,
    colorMapsProp
  );
  const initTransferFunction = getTransferFunction(
    model.useTransferFunction,
    transferFunctionProp
  );

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  // Control colorMap, transferFunction, and sliders in state; override on prop change
  const [colorMap, setColorMap] = useState(initColorMap);
  useEffect(() => {
    setColorMap(initColorMap);
  }, [initColorMap]);

  const [transferFunction, setTransferFunction] =
    useState(initTransferFunction);
  useEffect(() => {
    setTransferFunction(initTransferFunction);
  }, [initTransferFunction]);

  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene
        model={model}
        colorMap={colorMap}
        transferFunction={transferFunction}
        sliders={sliders}
      />

      {controlsVisible && (
        <Controls
          colorMaps={colorMaps}
          model={model}
          initTransferFunction={initTransferFunction}
          colorMap={colorMap}
          sliders={sliders}
          setColorMap={setColorMap}
          setTransferFunction={setTransferFunction}
          setSliders={setSliders}
          reset={() => {
            setColorMap(initColorMap);
            setSliders(DEFAULT_SLIDERS);
            setTransferFunction(initTransferFunction);
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
  /**
   * Array of color maps available in the controls.
   *  name: Common name of the color map
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
    /**
     * The current color map applied by the transferFunction REQUIRED
     * It will default to the first object in colorMaps if no colorMap is provided
     * It will default to grayscale if neither colorMap nor colorMaps is provided.
     *
     *  name: Common name of the color map
     *  path: Path to the color map src
     */
    colorMap: PropTypes.exact({
      name: PropTypes.string,
      path: PropTypes.string,
    }),

    /** Channel to load data from (R:1, G:2, B:3)*/
    channel: PropTypes.number,

    /** Increase/decrease voxels intensity */
    intensity: PropTypes.number,

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

    /** Whether or not to apply a transfer function to the model */
    useTransferFunction: PropTypes.bool,
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
};

VolumeViewer.defaultProps = {
  colorMaps: [],
  controlsVisible: false,
  transferFunction: DEFAULT_TRANSFER_FUNCTION,
  useDefaultColorMaps: true,
};

export default VolumeViewer;
