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
// Only want to reset <OpacityControls> when model.initTransferFunction changes? Use React.memo

function VolumeViewer({
  className,
  style,
  colorMaps,
  controlsVisible,
  models: modelsProp,
}) {
  // Merge passed in models with default properties
  const initModels = useMemo(
    () =>
      modelsProp.map((model) => {
        const transferFunction = model.useTransferFunction
          ? // Inject DEFAULT_TRANSFER_FUNCTION if transferFunction property is not given
            model.transferFunction ?? DEFAULT_TRANSFER_FUNCTION
          : // Always use DEFAULT_TRANSFER_FUNCTIOn when !useTransferFunction
            DEFAULT_TRANSFER_FUNCTION;

        // The model's colorMap must be in the colorMaps array
        if (!colorMaps.includes(model.colorMap)) {
          throw new Error(
            "Color Map '" + model.colorMap + "' not in colorMaps"
          );
        }
        return {
          ...DEFAULT_MODEL,
          ...model,
          transferFunction: transferFunction,
          initTransferFunction: transferFunction,
        };
      }),
    [modelsProp, colorMaps]
  );

  // Control the models in state; override on prop change
  const [models, setModels] = useState(initModels);
  useEffect(() => {
    setModels(initModels);
  }, [initModels]);

  // Always begin with DEFAULT_SLIDERS value
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene models={models} sliders={sliders} />

      {controlsVisible && (
        <Controls
          colorMaps={colorMaps}
          // initModel={initModel}
          // model={model}
          models={models}
          sliders={sliders}
          // setModel={setModel}
          setModels={setModels}
          setSliders={setSliders}
          reset={() => {
            // setModel(initModel);
            setModels(initModels);
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
  /**
   * The current color map applied to the model
   * The colorMap must be present in the colorMaps array
   * REQUIRED
   */
  colorMap: COLOR_MAP.isRequired,

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
});

VolumeViewer.propTypes = {
  /**
   * Array of color maps available in the controls.
   *  name: Common name of the color map
   *  path: Path to the color map src
   */
  colorMaps: PropTypes.arrayOf(COLOR_MAP),

  /** Whether or not the controls can be seen */
  controlsVisible: PropTypes.bool,

  /** Array of models loaded into aframe REQUIRED */
  models: PropTypes.arrayOf(MODEL).isRequired,
};

VolumeViewer.defaultProps = {
  colorMaps: [],
  controlsVisible: false,
};

export default VolumeViewer;
