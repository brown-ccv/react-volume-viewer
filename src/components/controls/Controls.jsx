import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.js";
import ClipControls from "./ClipControls.jsx";

const Wrapper = styled.div`
  position: absolute;
  top: 25px;
  left: 25px;
  width: 300px;
  padding: 15px;

  background-color: white;
  border-radius: 5%;

  > * {
    margin: 25px 0;
  }

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;

export default function Controls(props) {
  const { state, setState, sliderRange, colorMaps } = props;

  return (
    <Wrapper>
      <ColorMapControls 
        state={state} setState={setState}
        colorMaps={colorMaps}
      />

      
      {
        state.transferFunction && 
        <OpacityControls state={state} setState={setState} />
      }

      <ClipControls 
        state={state} setState={setState} 
        sliderRange={sliderRange}/>
    </Wrapper>
  );
}
