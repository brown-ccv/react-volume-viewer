import React from "react";
import styled from "styled-components";

// import OpacityControls from "./OpacityControl";
// import ColorMapControls from "./ColorMapControls";
// import ClipControls from "./ClipControls";

const Wrapper = styled.div`
  position: absolute;
  top: 25px;
  left: 25px;
  width: 300px;
  padding: 4px;

  background-color: white;
  border-radius: 5%;

  > * {
    margin: 25px 5px;
  }

  > *:first-child {
    margin-top: 5px;
  }

  > *:last-child {
    margin-bottom: 5px;
  }
`;

export default function Controls(props) {
  return (
    <Wrapper>
      {/* <ColorMapControls /> */}
      <div>Color Map Controls</div>

      {/* <OpacityControls /> */}
      <div>Opacity Controls</div>

      {/* <ClipControls /> */}
      <div>Color Map Controls</div>
    </Wrapper>
  );
}
