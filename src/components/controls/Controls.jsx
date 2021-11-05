import React from "react";
import styled from "styled-components";

// import OpacityControls from "./OpacityControl";
// import ColorMapControls from "./ColorMapControls";
// import ClipControls from "./ClipControls";

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

  /*
    TODO: All 3 will need state
    TODO: Clip Controls needs sliderRange
  */
  return (
    <Wrapper>
      {/* <ColorMapControls /> */}
      <div>Color Map Controls</div>

      {/* <OpacityControls /> */}
      {state.transferFunction && <div>Opacity Controls</div>}

      {/* <ClipControls /> */}
      <div>Clip Controls</div>
    </Wrapper>
  );
}
