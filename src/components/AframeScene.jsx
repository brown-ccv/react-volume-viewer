import React from "react";
import { Container, Button } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";

export default function AframeScene(props) {
  const { state } = useVolumeViewerContext();

  return (
    <Container fluid className="scene p-0" id="visualizer">
      <Button>Aframe Scene Button</Button>
    </Container>
  );
}
