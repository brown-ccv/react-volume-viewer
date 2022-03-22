import React from "react";
import styled from "styled-components"

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <Checkbox
      type="checkbox"
      checked={enabled}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        setModels((models) => [
          ...models.slice(0, modelIdx),
          {
            ...models[modelIdx],
            enabled: e.target.checked,
          },
          ...models.slice(modelIdx + 1),
        ]);
      }}
    />
  );
}

const Checkbox = styled.input`
  margin: 0;
`

export default EnabledControls;
