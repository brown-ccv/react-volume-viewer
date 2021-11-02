import React from "react";
import styled from "styled-components";
import { Stack } from "react-bootstrap";

// import OpacityControls from "./OpacityControl";
// import ColorMapControls from "./ColorMapControls";
// import ClipControls from "./ClipControls";

const ControlsStack = styled(Stack)`
  position: absolute;
  z-index: 1;
  top: 25px;
  left: 25px;

  width: 250px;
  background-color: white;
`;

export default function Controls(props) {
  return (
    <ControlsStack gap={3}>
      {/* <ColorMapControls /> */}
      <div>Color Map Controls</div>

      {/* <OpacityControls /> */}
      <div>Opacity Controls</div>

      {/* <ClipControls /> */}
      <div>Color Map Controls</div>
    </ControlsStack>
  );
}
