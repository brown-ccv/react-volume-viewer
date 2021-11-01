import React from "react";
import { Container } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";

export default function AframeScene(props) {
  const { state } = useVolumeViewerContext();

  return (
    <Container fluid className="p-0" id="visualizer">
      This is Aframe
    </Container>
  );
}
