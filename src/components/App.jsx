import React, { useEffect } from "react";
import styled from "styled-components";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

const sliderRange = { min: 0, max: 1 }

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
    spacing,
    useDefaultColorMaps,
    useTransferFunction,
  } = props;
  console.log("PROPS", props);

  const [state, setState] = React.useState({
    colorMap: colorMap,
    transferFunction: initTransferFunction,
    sliders: { 
      x: [sliderRange.min, sliderRange.max], 
      y: [sliderRange.min, sliderRange.max],
      z: [sliderRange.min, sliderRange.max],
    }
  })

  // Prop changes should cause re-render automatically

  // TODO: Add loading spinner centered on scene (could leave in AframeScene?)
  return (
    <Wrapper>
      <AframeScene 
        state={state} setState={setState}
      />

      {
        controlsVisible && 
        <Controls 
          state={state} setState={setState}
          sliderRange={sliderRange}
        />
      }
    </Wrapper>
  );
}
