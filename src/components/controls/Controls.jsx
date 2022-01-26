import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.jsx";
import ClipControls from "./ClipControls.jsx";

function Controls({
  colorMaps,
  model,
  useTransferFunction,
  initColorMap,
  initTransferFunction,
  colorMap,
  setColorMap,
  transferFunction,
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
  position: absolute;
  overflow: auto;
  left: 8px;
  top: 8px;
  width: 300px;
  height: fit-content;
  max-height: calc(100% - 48px); // Leaves 8px to the edge of the AframeScene
  padding: 16px;
  background-color: white;
`;

const Button = styled.button``;

export default Controls;
