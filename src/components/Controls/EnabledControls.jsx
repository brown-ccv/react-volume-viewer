import React from "react";
import styled from "styled-components";

import Section from "./Section.jsx";
import Title from "./Title.jsx";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <FlexSection>
      <Title>Enabled?</Title>
      <input
        type="checkbox"
        role="switch"
        checked={enabled}
        onChange={(event) =>
          setModels((models) => {
            console.log(models, models[modelIdx]);
            return [
              ...models.slice(0, modelIdx),
              {
                ...models[modelIdx],
                enabled: event.target.checked,
              },
              ...models.slice(modelIdx + 1),
            ];
          })
        }
      />
    </FlexSection>
  );
}

const FlexSection = styled(Section)`
  display: flex;
  justify-content: center;
  color: blue;
`

export default EnabledControls;
