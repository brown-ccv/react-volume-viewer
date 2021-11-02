import React, { useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";
import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

export default function App(props) {
  const {
    colorMap,
    colorMaps,
    controlsVisible,
    dataRange,
    initTransferFunction,
    path,
    position,
    rotation,
    scale,
    slices,
    sliderRange,
    spacing,
    useDefaultColorMaps,
    useTransferFunction,
  } = props;
  console.log("PROPS", props);

  const { state, dispatch } = useVolumeViewerContext();

  // Change Model when prop changes
  // useEffect(() => {
  //   dispatch({
  //     type: "CHANGE_MODEL",
  //     model: {
  //       path: path,
  //       slices: slices,
  //       spacing: spacing,
  //       position: position,
  //       rotation: rotation,
  //       scale: scale,
  //       dataRange: dataRange,
  //     },
  //   });
  // }, []);

  return (
    <Container fluid className="p-0">
      {/* {controlsVisible && <Controls />} */}
      <AframeScene />
    </Container>
  );
}
