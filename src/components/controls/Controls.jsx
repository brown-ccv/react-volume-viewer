import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.jsx";
import ClipControls from "./ClipControls.jsx";

function Controls({
  colorMaps,
  model,
  useTransferFunction,
  initTransferFunction,
  colorMap,
  setColorMap,
  setTransferFunction,
  sliders,
  setSliders,
  reset,
}) {
  return (
    <Wrapper>
      <ColorMapControls
        colorMaps={colorMaps}
        colorMap={colorMap}
        setColorMap={setColorMap}
      />

      {useTransferFunction && (
        <OpacityControls
          range={model.range}
          initTransferFunction={initTransferFunction}
          setTransferFunction={setTransferFunction}
        />
      )}
      <Button onClick={reset}> Reset </Button>

      <ClipControls sliders={sliders} setSliders={setSliders} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background-color: white;
  position: absolute;
  box-sizing: border-box;
  padding: 0px 16px; // Section.jsx handles spacing on y axis
  width: 320px;
  left: 8px;
  top: 8px;
  height: fit-content;
  max-height: calc(100% - 16px); // Leaves 8px to the bottom of the AframeScene
  overflow: auto;
`;

const Button = styled.button``;

export default Controls;
