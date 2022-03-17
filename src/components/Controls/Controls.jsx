import React from "react";
import styled from "styled-components";

import ColorMapControls from "../ColorMapControls";
import OpacityControls from "../OpacityControls";
import ClipControls from "../ClipControls";
function Controls({
  colorMaps,
  initModel,
  model,
  sliders,
  setModel,
  setSliders,
  reset,
}) {
  console.log(model)
  return (
    <Wrapper>
      <ColorMapControls
        colorMaps={colorMaps}
        model={model}
        setModel={setModel}
      />

      {model.useTransferFunction && (
        <OpacityControls
          initModel={initModel}
          range={model.range}
          setModel={setModel}
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
  padding: 0px 16px; // Section component handles spacing on y axis
  width: 320px;
  left: 8px;
  top: 8px;
  height: fit-content;
  max-height: calc(100% - 16px); // Leaves 8px to the bottom of the AframeScene
  overflow: auto;
`;

const Button = styled.button``;

export default Controls;
