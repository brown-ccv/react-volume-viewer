import React from "react";
import styled from "styled-components";
import { Container, Button } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";

const SceneContainer = styled(Container)`
  height: 90vh !important;
`;

export default function AframeScene(props) {
  const { state } = useVolumeViewerContext();

  return (
    <SceneContainer fluid id="visualizer">
      <Button>Aframe Scene Button</Button>
    </SceneContainer>
  );
}
