import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import {
  DEFAULT_MODEL,
  DEFAULT_TRANSFER_FUNCTION,
  DEFAULT_SLIDERS,
} from "../../constants";

import Controls from "../Controls";
import AframeScene from "../AframeScene";

// TODO: Changing model from props will reset the transferFunction.
// Only want to reset <OpacityControls> when model.transferFunction specifically changes?

function VolumeViewer({
  className,
  style,
  colorMaps: colorMapsProp,
  controlsVisible,
  model: modelProp,
}) {
  // Get initial values based on prop input. These will update on prop change.
  const initModel = useMemo(
    () => ({
      ...DEFAULT_MODEL,
      ...modelProp,
      transferFunction: modelProp.useTransferFunction
        ? // Inject DEFAULT_TRANSFER_FUNCTION if transferFunction property is not given
          modelProp.transferFunction ?? DEFAULT_TRANSFER_FUNCTION
        : // Always use DEFAULT_TRANSFER_FUNCTIOn when !useTransferFunction
          DEFAULT_TRANSFER_FUNCTION,
    }),
    [modelProp]
  );
  const colorMaps = useMemo(
    () =>
      // Convert colorMaps to an object
      colorMapsProp.reduce(
        (obj, colorMap) =>
          Object.assign(obj, { [colorMap.name]: colorMap.path }),
        {}
      ),
    [colorMapsProp]
  );

  // Control the model in state; override on prop change
  const [model, setModel] = useState(initModel);
  useEffect(() => {
    setModel(initModel);
  }, [initModel]);

  // Always begin with DEFAULT_SLIDERS value
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene colorMaps={colorMaps} model={model} sliders={sliders} />

      {controlsVisible && (
        <Controls
          colorMaps={colorMaps}
          initModel={initModel}
          model={model}
          sliders={sliders}
          setModel={setModel}
          setSliders={setSliders}
          reset={() => {
            setModel(initModel);
            setSliders(DEFAULT_SLIDERS);
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
    /** Common name of the color map applied by the transfer function. REQUIRED */
    colorMap: PropTypes.string.isRequired,

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
  }),
};

VolumeViewer.defaultProps = {
  colorMaps: [],
  controlsVisible: false,
};

export default VolumeViewer;
