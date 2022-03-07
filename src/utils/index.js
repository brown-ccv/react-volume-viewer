import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith } from "lodash";

import { DEFAULT_MODEL, DEFAULT_TRANSFER_FUNCTION } from "../constants";

// Custom validation function for the model's prop
function validateModels(models) {
  const modelNames = new Set();
  models.forEach((model) => {
    // The model's name must be unique
    if (modelNames.has(model.name))
      throw new Error("Model name '" + model.name + "' is not unique");
    else modelNames.add(model.name);

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

  const modelsDiff = differenceWith(models, prevModels, isEqual);
  const noChange = isEmpty(modelsDiff);

  console.log("MODELS noChange", noChange);

  // Update reference to previous value if not the same
  useEffect(() => {
    if (!noChange) previousRef.current = models;
  });
  return noChange ? prevModels : models;
}

export { validateModels, buildModels, useModelsPropMemo };
