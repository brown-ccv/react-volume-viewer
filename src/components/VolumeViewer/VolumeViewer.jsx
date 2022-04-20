import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Controls from "../Controls";
import AframeScene from "../AframeScene";

import {
  Blending,
  DEFAULT_SLIDERS,
  DEFAULT_POSITION,
  DEFAULT_ROTATION,
  DEFAULT_SCALE,
  DEFAULT_MODEL,
} from "../../constants";
import {
  validateInt,
  validateModel,
  validateSlider,
  validateVec3String,
} from "../../utils";
import { useModelsPropMemo } from "../../hooks";

function VolumeViewer({
  className,
  style,
  blending,
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
    // Inject default model
    setModels(
      newModels.map((model) => ({
        ...DEFAULT_MODEL,
        ...model,
      }))
    );
  }, [newModels]);

  // Sliders apply clipping to the volume as a whole
  const [sliders, setSliders] = useState(slidersProp);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene
        blending={blending}
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
          setModels(
            newModels.map((model) => ({
              ...DEFAULT_MODEL,
              ...model,
            }))
          );
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

VolumeViewer.propTypes = {
  /**
   * Blending enum exposed to the user
   *  None: Don't apply any blending
   *  Add: Apply additive blending
   */
  blending: PropTypes.oneOf(Object.values(Blending)),

  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED */
  models: PropTypes.arrayOf(validateModel).isRequired,

  /** Position of the dataset in the scene */
  position: validateVec3String,

  /** Position of the dataset in the scene */
  rotation: validateVec3String,

  /** Scale of the dataset in the scene */
  scale: validateVec3String,

  /** Number of slices used to generate the model REQUIRED */
  slices: validateInt,

  /**
   * Spacing between the slices of the model across each axis
   * Each slider is an array of exactly two values between 0 and 1. slider[0] must be <= slider[1]
   *  slider[0]: Minimum slider value
   *  slider[1]: Maximum slider value
   */
  spacing: validateVec3String,

  /* Sliders for control of clipping along the x, y, and z axes */
  sliders: PropTypes.exact({
    x: validateSlider,
    y: validateSlider,
    z: validateSlider,
  }),
};

VolumeViewer.defaultProps = {
  blending: Blending.Add,
  controlsVisible: false,
  position: DEFAULT_POSITION,
  rotation: DEFAULT_ROTATION,
  scale: DEFAULT_SCALE,
  sliders: DEFAULT_SLIDERS,
};

export default VolumeViewer;
