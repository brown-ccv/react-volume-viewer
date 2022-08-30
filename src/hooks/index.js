import { useEffect, useRef } from "react";
import { isEqual } from "lodash";

// Custom useMemo hook for models
function useModelsPropMemo(models) {
  const previousRef = useRef();
  const prevModels = previousRef.current;

  // Returns true if models and prevModels are equal
  // This is returning true constantly
  const noChange = isEqual(models, prevModels);

  // Update reference to previous value if not the same
  useEffect(() => {
    if (!noChange) previousRef.current = models;
  });
  return noChange ? prevModels : models;
}

export { useModelsPropMemo };
