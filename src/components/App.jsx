import React, { useEffect } from "react";
import styled from "styled-components";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
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

  // Change Model when prop changes
  // This will happen automatically when prop changes
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

  // TODO: Add loading spinner centered on scene
  return (
    <Wrapper>
      <AframeScene />
      {controlsVisible && <Controls />}
    </Wrapper>
  );
}
