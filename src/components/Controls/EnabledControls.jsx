import React from "react";
import visible from "../../images/visible.svg";
import visibleOff from "../../images/visible_off.svg";
// import styled from "styled-components";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <img
      src={enabled ? visible : visibleOff}
      alt={enabled ? "visible" : "visible off"}
      onClick={(e) => {
        e.stopPropagation();
        setModels((models) => [
          ...models.slice(0, modelIdx),
          {
            ...models[modelIdx],
            enabled: !enabled,
          },
          ...models.slice(modelIdx + 1),
        ]);
      }}
    />
  );
}

export default EnabledControls;
