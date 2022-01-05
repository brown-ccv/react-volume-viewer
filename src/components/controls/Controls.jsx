import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.jsx";
import ClipControls from "./ClipControls.jsx";

function Controls({
  colorMaps,
  useTransferFunction,
  initTransferFunction,
  model,
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
  position: absolute;
  overflow: auto;
  left: 25px;
  top: 25px;
  bottom: 25px;
  margin: auto 0;
  width: 300px;
  height: fit-content;
  max-height: calc(100% - 50px); // Leaves 25px to the edge of the AframeScene
  padding: 15px;
  background-color: white;
  border-radius: 5%;
`;

const Button = styled.button``;

export default Controls;
