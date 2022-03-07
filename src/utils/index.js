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
function buildModels(models) {}

// Custom comparison function 
function useMemoCompareModelsProp(models) {}

export { validateModels, buildModels, useMemoCompareModelsProp };
