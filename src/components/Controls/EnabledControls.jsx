import React from "react";
import styled from "styled-components";

import Section from "./Section.jsx";
import Title from "./Title.jsx";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <FlexSection>
      <StyledTitle>Enabled?</StyledTitle>
      <Switch
        type="checkbox"
        checked={enabled}
        onChange={(event) =>
          setModels((models) => {
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
  justify-content: space-between;
  align-items: baseline;
`;

const StyledTitle = styled(Title)`
  margin: 0;
`;

const Switch = styled.input`
  transform: scale(1.5);
`;

export default EnabledControls;
