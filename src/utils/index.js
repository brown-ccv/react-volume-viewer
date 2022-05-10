import { isEqual, pick, isArray, isObject, transform } from "lodash";

/** EXPORTS */

// Filter model properties needed from aframe
function getAframeModels(models) {
  const aframeModels = models.map((model) => {
    // Pick only needed properties
    const aframeModel = pick(model, [
      "colorMap",
      "enabled",
      "intensity",
      "name",
      "path",
      "transferFunction",
      "useTransferFunction",
      "useColorMap",
    ]);

    /* colorMap.path is either a png encoded string or the path to a png
      png encoded strings begin with data:image/png;64
      Remove ; to parse into aframe correctly (re-injected in model.js)
    */
    aframeModel.colorMap = {
      ...model.colorMap,
      path: model.colorMap.path.replace("data:image/png;", "data:image/png"),
    };

    return aframeModel;
  });
  return JSON.stringify(aframeModels.filter((model) => model.enabled));
}

// Recursively find the differences between two objects
// https://davidwells.io/snippets/get-difference-between-two-objects-javascript
function deepDifference(oldObj, newObj) {
  const changes = (newObj, oldObj) => {
    let arrayIndexCounter = 0;
    return transform(newObj, (result, value, key) => {
      if (!isEqual(value, oldObj[key])) {
        const resultKey = isArray(oldObj) ? arrayIndexCounter++ : key;
        result[resultKey] =
          isObject(value) && isObject(oldObj[key])
            ? changes(value, oldObj[key])
            : value;
      }
    });
  };

  return changes(newObj, oldObj);
}

function validateVec3String(props, propName, componentName) {
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
}

function validateInt(props, propName, componentName) {
  const num = props[propName];

  // slices is a required prop
  if (propName === "slices" && num === undefined) {
    return new Error(
      `The prop '${propName}' is required in '${componentName}', ` +
        `but its value is '${num}'.`
    );
  }

  // Value must be an integer
  if (!(Number.isInteger(num) && num > 0)) {
    return new Error(
      `Invalid prop '${propName}' of type '${typeof num}' ` +
        `supplied to '${componentName}'. '${num}' is not a positive integer`
    );
  }
}

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
function validateModel(models, idx, componentName, location, propFullName) {
  const model = models[idx];

  // Each model must have a unique name
  const modelNames = new Set();
  for (const model of models) {
    if (modelNames.has(model.name))
      return new Error(
        `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
          `Name '${model.name}' is not unique in 'models'.`
      );
    else modelNames.add(model.name);
  }

  try {
    if ("colorMaps" in model) validateColorMaps(model.colorMaps, model.name);
    if ("transferFunction" in model)
      validateTransferFunction(model.transferFunction);
  } catch (error) {
    return new Error(
      `Invalid prop '${propFullName}' supplied to '${componentName}'. ` +
        error.message
    );
  }
}

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
  getAframeModels,
  deepDifference,
  validateModel,
  validateSlider,
  validateVec3String,
  validateInt,
};
