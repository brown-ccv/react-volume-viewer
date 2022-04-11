import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith, pick } from "lodash";

import { DEFAULT_MODEL, DEFAULT_TRANSFER_FUNCTION } from "../constants";

// Custom validation function for the 'models' prop
function validateModels(models) {
  const modelNames = new Set();
  models.forEach((model) => {
    // The model's name must be unique
    if (modelNames.has(model.name))
      throw new Error("Model name '" + model.name + "' is not unique");
    else modelNames.add(model.name);

    // "colorMap" is required unless !useColorMap
    // "transferFunction is required unless !useColorMap"

    if ("colorMaps" in model) {
      // The model's colorMap must be in the colorMaps array
      if (!model.colorMaps.includes(model.colorMap))
        throw new Error("Color Map '" + model.colorMap + "' not in colorMaps");

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
  });
  return;
}

// Custom validation function for the 'sliders' prop
function validateSlider(prop, key, componentName, location, propFullName) {
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
}

// Build models from prop and default values
function buildModels(models) {
  return models.map((model) => {
    // Determine transferFunction and build model
    const transferFunction = model.useTransferFunction
      ? // Inject DEFAULT_TRANSFER_FUNCTION if transferFunction property is not given
        model.transferFunction ?? DEFAULT_TRANSFER_FUNCTION
      : // Always use DEFAULT_TRANSFER_FUNCTIOn when !useTransferFunction
        DEFAULT_TRANSFER_FUNCTION;

    // Merge model with DEFAULT_MODEL object
    return {
      ...DEFAULT_MODEL,
      ...model,
      transferFunction: transferFunction,
      initTransferFunction: transferFunction,
    };
  });
}

// Custom useMemo hook for models
function useModelsPropMemo(models) {
  validateModels(models);

  // Ref for storing previous models
  const previousRef = useRef();
  const prevModels = previousRef.current;

  // Returns true if models and prevModels are equal
  const noChange = isEmpty(differenceWith(models, prevModels, isEqual));

  // Update reference to previous value if not the same
  useEffect(() => {
    if (!noChange) previousRef.current = models;
  });
  return noChange ? prevModels : models;
}

// Filter model properties needed from aframe
function getAframeModels(models) {
  const out = models.map((model) => {
    // Pick only needed properties
    const aframeModel = pick(model, [
      "channel",
      "colorMap",
      "enabled",
      "intensity",
      "name",
      "path",
      "slices",
      "spacing",
      "transferFunction",
      "useTransferFunction",
    ]);

    /* colorMap.path is either a png encoded string or the path to a png
      png encoded strings begin with data:image/png;64
      Remove ; to parse into aframe correctly (re-injected in model.js)
      TODO: Do colorMaps need to be a png?
    */
    aframeModel.colorMap = {
      ...model.colorMap,
      path: model.colorMap.path.replace("data:image/png;", "data:image/png"),
    };

    return aframeModel;
  });
  return JSON.stringify(out);
}

export {
  validateModels,
  validateSlider,
  buildModels,
  useModelsPropMemo,
  getAframeModels,
};
