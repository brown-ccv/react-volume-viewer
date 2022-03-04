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

// TODO: Changing controlsVisible will reset models (initModels runs)
// TODO: Changing any specific model property will reset all models' properties
// Need to do a deep comparison between initModels and prevInitModels
// and call setState (in useEffect) on models w/ difference between initModels and prevInitModels

function VolumeViewer({
  className,
  style,
  controlsVisible,
  models: modelsProp,
}) {
  // Merge passed in models with default properties
  const initModels = useMemo(() => {
    console.log("INIT MODELS")
    const modelNames = new Set();
    return modelsProp.map((model) => {
      // The model's name must be unique
      if (modelNames.has(model.name))
        throw new Error("Model name '" + model.name + "' is not unique");
      else modelNames.add(model.name);

      if ("colorMaps" in model) {
        // The model's colorMap must be in the colorMaps array
        if (!model.colorMaps.includes(model.colorMap))
          throw new Error(
            "Color Map '" + model.colorMap + "' not in colorMaps"
          );

        // The model's colorMaps' names must be unique
        const colorMapNames = new Set();
        model.colorMaps.forEach((colorMap) => {
          if (colorMapNames.has(colorMap.name))
            throw new Error(
              "Color map name '" +
                colorMap.name +
                "' is not unique on model '" +
                model.name +
                "'"
            );
          else colorMapNames.add(colorMap.name);
        });
      }

      // Determine transferFunction and build model
      const transferFunction = model.useTransferFunction
        ? // Inject DEFAULT_TRANSFER_FUNCTION if transferFunction property is not given
          model.transferFunction ?? DEFAULT_TRANSFER_FUNCTION
        : // Always use DEFAULT_TRANSFER_FUNCTIOn when !useTransferFunction
          DEFAULT_TRANSFER_FUNCTION;
      return {
        ...DEFAULT_MODEL,
        ...model,
        transferFunction: transferFunction,
        initTransferFunction: transferFunction,
      };
    });
  }, [modelsProp]);

  // Control the models in state; override on prop change
  // const [models, setModels] = useState(initModels);
  const [models, setModels] = useState([]);
  useEffect(() => {
    console.log("USE EFFECT")
    // Take in models and prevModels (using useRef and custom hook)
    // Compare prevModels and initModels. The change might only be 1 property of 1 model in the array
    // setModels() to  models, changing only the difference between prevModels and initModels

    // useEffect will be called with models changes now - do nothing if initModels and prevModels are equivalent
    // Might be better to compare the prop directly and make the initModels useMemo it's own callback function. That way you'd only have to call for the individual model
    
    setModels(initModels);
  }, [initModels]);

  // Always initialize to DEFAULT_SLIDERS
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);

  // Changing a components key will remount the entire thing
  // Because the model's position is handled internally by aframe we need to remount it to reset its position
  const [remountKey, setRemountKey] = useState(Math.random());

  return (
    <Wrapper key={remountKey} className={className} style={style}>
      <AframeScene models={models} sliders={sliders} />

      {controlsVisible && (
        <Controls
          models={models}
          sliders={sliders}
          setModels={setModels}
          setSliders={setSliders}
          reset={() => {
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
};

VolumeViewer.defaultProps = {
  controlsVisible: false,
};

export default VolumeViewer;
