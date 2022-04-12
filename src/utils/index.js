import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith, pick } from "lodash";
import { Model } from "../classes";

// Custom validation function for the 'models' prop
const validateModels = function (props, propName, componentName) {
  const models = props[propName];
  if (models === undefined) {
    return new Error(
      `Failed prop type: The prop '${propName}' is required in '${componentName}', but its value is '${models}'.`
    );
  }

  if (!Array.isArray(models)) {
    return new Error(
      `Failed prop type: Invalid prop '${propName}' of type '${typeof models}' ` +
        `supplied to '${componentName}', expected 'Array'.`
    );
  }

  const modelNames = new Set();
  for (const [idx, model] of models.entries()) {
    if (!(model instanceof Model)) {
      return new Error(
        `Failed prop type: Invalid prop '${propName}[${idx}]' of type '${typeof model}' ` +
          `supplied to '${componentName}', expected 'Model'. ` +
          `Prop has a value of '${model}'.`
      );
    }

    // The model's name must be unique
    if (modelNames.has(model.name))
      // TODO PropType error schema
      // return new Error("Model name '" + model.name + "' is not unique");
      return new Error(
        `Invalid prop '${propName}[${idx}].name' supplied to '${componentName}'. ` +
          `Name '${model.name}' is not unique in '${propName}'.`
      );
    else modelNames.add(model.name);

    // PropTypes wants errors to be returned, not thrown
    try {
      model.validate();
    } catch (error) {
      return new Error(
        `Invalid prop '${propName}[${idx}]' supplied to '${componentName}'. ` +
          error.message
      );
    }
  }
  return;
};

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

const validateVec3String = function (props, propName, componentName) {
  console.log(props, propName, componentName);
  // if (!/matchme/.test(props[propName])) {
  //   return new Error(
  //     'Invalid prop `' + propName + '` supplied to' +
  //     ' `' + componentName + '`. Validation failed.'
  //   );
  // }
};

// Custom useMemo hook for models
function useModelsPropMemo(models) {
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
  return JSON.stringify(out);
}

export {
  validateModels,
  validateSlider,
  validateVec3String,
  useModelsPropMemo,
  getAframeModels,
};
