import React from "react";
import visible from "../../images/visible.svg";
import visibleOff from "../../images/visible_off.svg";
import styled from "styled-components";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <VisibleImg
      src={enabled ? visible : visibleOff}
      alt={enabled ? "visible" : "not visible"}
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
  width: 1.125rem;
  height: 1.125rem;
`;

export default EnabledControls;
