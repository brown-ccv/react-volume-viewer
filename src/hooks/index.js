import { useEffect, useRef } from "react";
import { isEmpty, isEqual, differenceWith } from "lodash";

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

export { useModelsPropMemo };
