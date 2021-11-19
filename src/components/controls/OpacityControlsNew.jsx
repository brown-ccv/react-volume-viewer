import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

import Title from "./SectionTitle.jsx";
import Canvas from "./Canvas.jsx";

/** CONSTANTS **/
// const canvasPadding = 10; // Padding on the canvas
const hoverRadius = 15; // Pixel offset for registering hovering/clicks
const decimals = 2; // Number of decimals to display in labels
const initCanvasPoints = []; // Starting canvas points, used for reset

// TODO - Redraw when dataRange changes
function OpacityControls({ state, setState }) {
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

// // TODO: Change cursor
// // Auto: not grabbing and not hovering
// // Grab: hovering and not dragging
// // Grabbing: Dragging
// const OutlinedCanvas = styled.canvas`
//   outline: 1px solid;
//   cursor: ${(props) => props.cursor};
//   /* cursor: grab; */
// `;

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
