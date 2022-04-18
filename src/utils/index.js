import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith, pick } from "lodash";

/** EXPORTS */

// Custom useMemo hook for models
function useModelsPropMemo(models) {
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
      "blending",
      "colorMap",
      "enabled",
      "intensity",
      "name",
      "path",
      "slices",
      "spacing",
      "transferFunction",
      "useTransferFunction",
      "useColorMap",
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
  return JSON.stringify(out.filter((model) => model.enabled));
}

const validateVec3String = function (props, propName, componentName) {
  const string = props[propName];

  // spacing is a required prop
  if (propName === "spacing" && string === undefined) {
    return new Error(
      `The prop '${propName}' is required in '${componentName}', ` +
        `but its value is '${string}'.`
    );
  }

  // Should be 3 floats, space separated
  const arr = string.split(" ");
  if (arr.length !== 3) {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}'. ` +
        `String should contain 3 numbers, has '${arr.length}': '${string}'.`
    );
  }

  for (const num of arr) {
    if (isNaN(Number(num))) {
      return new Error(
        `Invalid prop '${propName}' supplied to '${componentName}'. ` +
          `'${num}' in '${string}' is not a number.`
      );
    }
  }
};

const validateInt = function (props, propName, componentName) {
  const num = props[propName];

  // slices is a required prop
  if (propName === "slices" && num === undefined) {
    return new Error(
      `The prop '${propName}' is required in '${componentName}', ` +
        `but its value is '${num}'.`
    );
  }

  // Value must be an integer
  if (!Number.isInteger(num)) {
    return new Error(
      `Invalid prop '${propName}' of type '${typeof num}' ` +
        `supplied to '${componentName}'. '${num}' is not an integer`
    );
  }
};

// Custom validation function for a single slider in the 'sliders' prop
function validateSlider(sliders, axis, componentName, location, propFullName) {
  const slider = sliders[axis];

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
  for (const [idx, val] of slider.entries()) {
    if (val < 0 || val > 1) {
      return new Error(
        `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
          `slider[${idx}] must be between 0 and 1 (inclusive)`
      );
    }
  }
}

// Custom validation function for a single model in the 'models' prop
const validateModel = function (
  models,
  idx,
  componentName,
  location,
  propFullName
) {
  const model = models[idx];

  // Each model must have a unique name
  const modelNames = new Set();
  for (const model of models) {
    if (modelNames.has(model.name))
      return new Error(
        `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
          `Name '${model.name}' is not unique in '${models}'.`
      );
    else modelNames.add(model.name);
  }

  try {
    // TODO: Validation changes when !useTransferFunction and !useColorMap
    validateColorMaps(model.colorMaps, model.name);
    if ("transferFunction" in model)
      validateTransferFunction(model.transferFunction);
  } catch (error) {
    return new Error(
      `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
        error.message
    );
  }
};

/** HELPER FUNCTIONS */

function validateColorMaps(colorMaps) {
  const colorMapNames = new Set();
  colorMaps.forEach((colorMap) => {
    // Each color map must have a unique name
    if (colorMapNames.has(colorMap.name))
      throw new Error("colorMap name '" + colorMap.name + "' is not unique");
    else colorMapNames.add(colorMap.name);
  });
}

// Each coordinate within the transfer function must be between (0,0) and (1,1)
function validateTransferFunction(transferFunction) {
  transferFunction.forEach((point) => {
    if (point.x === undefined || point.x < 0 || point.x > 1)
      throw new Error(
        `Error: ${point.x} in ${point} out of range. ` +
          `x coordinate must be between 0 and 1 (inclusive)`
      );

    if (point.y === undefined || point.y < 0 || point.y > 1)
      throw new Error(
        `Error: ${point.y} in ${point} out of range. ` +
          `y coordinate must be between 0 and 1 (inclusive)`
      );
  });
}

export {
  validateModel,
  validateSlider,
  validateVec3String,
  validateInt,
  useModelsPropMemo,
  getAframeModels,
};
