import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
// import OpacityControls from "./OpacityControls.js";
import OpacityControls from "./OpacityControlsNew.jsx";
import ClipControls from "./ClipControls.jsx";

function Controls(props) {
  const { state, setState, sliderRange, colorMaps } = props;

  return (
    <Wrapper>
      <ColorMapControls
        state={state}
        setState={setState}
        colorMaps={colorMaps}
      />

      {state.transferFunction && (
        <OpacityControls state={state} setState={setState} />
      )}

      <ClipControls
        state={state}
        setState={setState}
        sliderRange={sliderRange}
      />
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
  max-height: calc(100% - 50px);
  padding: 15px;
  background-color: white;
  border-radius: 5%;
`;

export default Controls;
