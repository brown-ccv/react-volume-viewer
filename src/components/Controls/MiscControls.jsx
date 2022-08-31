import React from "react";
import styled from "styled-components";

import Section from "./Section.jsx";

function MiscControls({ useColorMap, setUseColorMap, reset }) {
  console.log("CONTROLS", useColorMap);

  return (
    <FlexSection>
      <CheckBox>
        <span>Use Color Map</span>
        <Input
          type="checkbox"
          name="useColorMap"
          checked={useColorMap}
          onChange={() => setUseColorMap(!useColorMap)}
        />
      </CheckBox>
      <button onClick={reset}> Reset </button>
    </FlexSection>
  );
}

const FlexSection = styled(Section)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CheckBox = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  margin: 0 0.5rem;
`;

export default MiscControls;
