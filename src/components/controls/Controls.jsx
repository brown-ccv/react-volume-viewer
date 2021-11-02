import React from "react";
import styled from "styled-components";
import { Stack } from "react-bootstrap";

// import OpacityControls from "./OpacityControl";
// import ColorMapControls from "./ColorMapControls";
// import ClipControls from "./ClipControls";

const ControlsStack = styled(Stack)`
  width: 250px;
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
