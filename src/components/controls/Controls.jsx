import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.js";
import ClipControls from "./ClipControls.jsx";

function Controls(props) {
  const { state, setState, sliderRange, dataRange, colorMaps } = props;

  return (
    <Wrapper>
      <ColorMapControls
        state={state}
        setState={setState}
        colorMaps={colorMaps}
      />

      {state.transferFunction && (
        <OpacityControls
          state={state}
          setState={setState}
          dataRange={dataRange}
        />
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
  top: 25px;
  left: 25px;
  right: 25px;
  bottom: 25px;
  width: 300px;
  padding: 15px;

  background-color: white;
  border-radius: 5%;
`;

export default Controls;
