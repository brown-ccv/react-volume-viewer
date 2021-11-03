import React, { useEffect } from "react";
import styled from "styled-components";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";
import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

const RelativeContainer = styled(Container)`
  position: relative;
`;

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
    <RelativeContainer fluid className="p-0">
      <AframeScene />
      {controlsVisible && <Controls />}
    </RelativeContainer>
  );
}
