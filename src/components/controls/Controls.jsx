import React from "react";
import styled from "styled-components";

import ColorMapControls from "./ColorMapControls.jsx";
import OpacityControls from "./OpacityControls.jsx";
import ClipControls from "./ClipControls.jsx";

function Controls({ state, setState, colorMaps, initColorMap, useTransferFunction }) {
  return (
    <Wrapper>
      <ColorMapControls
        state={state}
        setState={setState}
        colorMaps={colorMaps}
      />

      {useTransferFunction && (
        <OpacityControls state={state} setState={setState} initColorMap={initColorMap} />
      )}

      <ClipControls state={state} setState={setState} />
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
