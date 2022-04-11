import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Controls from "../Controls";
import AframeScene from "../AframeScene";

import {
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
  Blending,
} from "../../constants";
import { buildModels, useModelsPropMemo, validateSlider } from "../../utils";

function VolumeViewer({
  className,
  style,
  controlsVisible,
  models: modelsProp,
  position,
  rotation,
  scale,
  slices,
  spacing,
  sliders: slidersProp,
}) {
  // Control the models in state; override on modelsProp change
  const [models, setModels] = useState([]);
  const newModels = useModelsPropMemo(modelsProp);
  useEffect(() => {
    setModels(buildModels(newModels));
  }, [newModels]);

  // Always initialize to DEFAULT_SLIDERS
  // TODO: Pass sliders as a prop
  const [sliders, setSliders] = useState(slidersProp);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene
        models={models}
        position={position}
        rotation={rotation}
        scale={scale}
        slices={slices}
        spacing={spacing}
        sliders={sliders}
      />

      <Controls
        controlsVisible={controlsVisible}
        models={models}
        sliders={sliders}
        setModels={setModels}
        setSliders={setSliders}
        reset={() => {
          setModels(buildModels(newModels));
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

/** The model to be displayed and it's related information */
const MODEL = PropTypes.shape({
  /** Blending function to use*/
  blending: PropTypes.instanceOf(Blending),

  /**
   * The current color map applied to the model
   * The colorMap must be present in the colorMaps array
   * REQUIRED
   */
  colorMap: COLOR_MAP.isRequired,

  /** Array of color maps available in the controls. */
  colorMaps: PropTypes.arrayOf(COLOR_MAP),

  /** Short description of the model */
  description: PropTypes.string,

  /** Flag to display the model */
  enabled: PropTypes.bool,

  /** Increase/decrease voxels intensity */
  intensity: PropTypes.number,

  /** Path to the model REQUIRED */
  path: PropTypes.string.isRequired,

  /** Minimum and maximum values of the model's dataset. */
  range: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    unit: PropTypes.string,
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

  /** Whether or not to apply a color map to the model */
  useColorMap: PropTypes.bool,
});

/**
 * Array of exactly two values between 0 and 1. slider[0] must be <= slider[1]
 *  slider[0]: Minimum slider value
 *  slider[1]: Maximum slider value
 */
const SLIDER = validateSlider;

VolumeViewer.propTypes = {
  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED */
  models: PropTypes.arrayOf(MODEL).isRequired,

  // TODO: CUSTOM STRING VALIDATION ON position, rotation, scale, spacing (vec3)
  // TODO: CUSTOM VALIDATION on slices (must be int)

  /** Position of the dataset in the scene */
  position: PropTypes.string.isRequired,

  /** Position of the dataset in the scene */
  rotation: PropTypes.string.isRequired,

  /** Scale of the dataset in the scene */
  scale: PropTypes.string.isRequired,

  /** Number of slices used to generate the model */
  slices: PropTypes.number.isRequired,

  /** Spacing between the slices of the model */
  spacing: PropTypes.string.isRequired,

  /* Sliders for control of clipping along the x, y, and z axes */
  sliders: PropTypes.exact({
    x: SLIDER,
    y: SLIDER,
    z: SLIDER,
  }).isRequired,
};

VolumeViewer.defaultProps = {
  controlsVisible: false,
  position: DEFAULT_POSITION,
  rotation: DEFAULT_ROTATION,
  scale: DEFAULT_SCALE,
  sliders: DEFAULT_SLIDERS,
};

export default VolumeViewer;
