import React from "react";
import visible from "../../images/visible.svg";
import visibleOff from "../../images/visible_off.svg";
import styled from "styled-components";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <VisibleImg
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

const VisibleImg = styled.img`
  width: 18px;
  height: 18px;
`;

export default EnabledControls;
