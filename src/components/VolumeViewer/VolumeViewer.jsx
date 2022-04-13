import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { DEFAULT_SLIDERS } from "../../constants";

import Controls from "../Controls";
import AframeScene from "../AframeScene";
import { buildModels, useModelsPropMemo } from "../../utils";

function VolumeViewer({
  className,
  style,
  controlsVisible,
  models: modelsProp,
  sliders: slidersProp,
}) {
  // Control the models in state; override on modelsProp change
  const [models, setModels] = useState([]);
  const newModels = useModelsPropMemo(modelsProp);
  useEffect(() => {
    setModels(buildModels(newModels));
  }, [newModels]);

  // Always initialize to slidersProp
  const [sliders, setSliders] = useState(slidersProp);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene models={models} sliders={sliders} />

      <Controls
        controlsVisible={controlsVisible}
        models={models}
        sliders={sliders}
        setModels={setModels}
        setSliders={setSliders}
        reset={() => {
          setModels(buildModels(modelsProp));
          setSliders(DEFAULT_SLIDERS);
          setRemountKey(Math.random());
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
`;

/**
 * Object containing the name and path to a color map image
 *  name: Common name of the color map
 *  path: Path to the color map source image
 */
const COLOR_MAP = PropTypes.exact({
  name: PropTypes.string,
  path: PropTypes.string,
});

/**
 * Array of two values between 0 and 1
 * arr[0]: Minimum slider value
 * arr[1]: Maximum slider value
 */
 const SLIDER = function (prop, key, componentName, location, propFullName) {
  const slider = prop[key];

  // Array length is exactly 2
  if (slider.length !== 2) {
    return new Error(
      `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
        `${propFullName} must be an array of length 2.`
    );
  }

  // Minimum slider value must be <= maximum
  if (slider[0] > slider[1]) {
    return new Error(
      `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
        `${propFullName}[0] must be <= ${propFullName}[1].`
    );
  }

  // Slider values must be between 0 and 1
  for (let [idx, val] of slider.entries()) {
    if (val < 0 || val > 1) {
      return new Error(
        `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
          `slider[${idx}] must be between 0 and 1 (inclusive)`
      );
    }
  }
};

/** The model to be displayed and it's related information */
const MODEL = PropTypes.shape({
  /**
   * The current color map applied to the model
   * The colorMap must be present in the colorMaps array
   * REQUIRED
   */
  colorMap: COLOR_MAP.isRequired,

  /** Array of color maps available in the controls. */
  colorMaps: PropTypes.arrayOf(COLOR_MAP),

  /** Channel to load data from (R:1, G:2, B:3)*/
  channel: PropTypes.number,

  /** Short description of the model */
  description: PropTypes.string,

  /** Flag to display the model */
  enabled: PropTypes.bool,

  /** Increase/decrease voxels intensity */
  intensity: PropTypes.number,

  /** Path to the model REQUIRED */
  path: PropTypes.string.isRequired,

  /** Position of the model in the scene */
  position: PropTypes.string,

  /** Minimum and maximum values of the model's dataset. */
  range: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
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

  /** Whether or not to apply a transfer function to the model */
  useTransferFunction: PropTypes.bool,
});

VolumeViewer.propTypes = {
  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED */
  models: PropTypes.arrayOf(MODEL).isRequired,

  /* Sliders for control of clipping along the x, y, and z axes */
  sliders: PropTypes.exact({
    x: SLIDER,
    y: SLIDER,
    z: SLIDER,
  }),
};

VolumeViewer.defaultProps = {
  controlsVisible: false,
  sliders: DEFAULT_SLIDERS,
};

export default VolumeViewer;
