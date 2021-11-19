import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

import Title from "./SectionTitle.jsx";
import Canvas from "./Canvas.jsx";

function OpacityControls({ state, setState }) {
  const decimals = 2;
  const dataRange = {
    ...state.model.range,
    mid: (state.model.range.min + state.model.range.max) / 2,
  };

  return (
    <Wrapper>
      <Title>Transfer Function</Title>
      <Canvas state={state} setState={setState} />

      <Labels>
        <LabelText>
          {dataRange.min.toFixed(decimals)} {dataRange.unit}
        </LabelText>
        <LabelText>
          {dataRange.mid.toFixed(decimals)}
          {dataRange.unit}
        </LabelText>
        <LabelText>
          {dataRange.max.toFixed(decimals)} {dataRange.unit}
        </LabelText>
      </Labels>

      <p>
        Double-click to add a point to the transfer function. Right-click to
        remove a point. Drag points to change the function.
      </p>
      <Button onClick={() => setCanvasPoints(initCanvasPoints)}> Reset </Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 25px 0;
`;

const Labels = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const LabelText = styled.p`
  font-weight: bold;
  margin: 0;
  font-size: 11px;
`;

const Button = styled.button``;

export default OpacityControls;
