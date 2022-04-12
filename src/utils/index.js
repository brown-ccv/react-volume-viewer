import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith, pick } from "lodash";
import { Model } from "../classes";

// Custom validation function for the 'models' prop
const validateModels = function (props, propName, componentName) {
  const models = props[propName];

  // models is required
  if (models === undefined) {
    return new Error(
      `The prop '${propName}' is required in '${componentName}', ` +
        `but its value is '${models}'.`
    );
  }

  // models is of array type
  if (!Array.isArray(models)) {
    return new Error(
      `Invalid prop '${propName}' of type '${typeof models}' ` +
        `supplied to '${componentName}'. '${models}' is not of type 'Array'.`
    );
  }

  const modelNames = new Set();
  for (const [idx, model] of models.entries()) {
    // Each model in models is of type Model
    if (!(model instanceof Model)) {
      return new Error(
        `Invalid prop '${propName}[${idx}]' of type '${typeof model}' ` +
          `supplied to '${componentName}'. '${model}' is not of type 'Model'`
      );
    }

    // The model's name must be unique
    if (modelNames.has(model.name))
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
  for (const [idx, val] of slider.entries()) {
    if (val < 0 || val > 1) {
      return new Error(
        `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
          `slider[${idx}] must be between 0 and 1 (inclusive)`
      );
    }
  }
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
  return JSON.stringify(out.filter((model) => model.enabled));
}

export {
  validateModels,
  validateSlider,
  validateVec3String,
  validateInt,
  useModelsPropMemo,
  getAframeModels,
};
