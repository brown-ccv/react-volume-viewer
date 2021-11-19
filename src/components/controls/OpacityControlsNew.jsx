import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";
// import useCanvas from "../../hooks/useCanvas.jsx";
import Canvas from "./Canvas.jsx";

/** CONSTANTS **/
// const canvasPadding = 10; // Padding on the canvas
const hoverRadius = 15; // Pixel offset for registering hovering/clicks
const decimals = 2; // Number of decimals to display in labels
const initCanvasPoints = []; // Starting canvas points, used for reset

// Data Ranges and Transformations
// Transfer Function:   {x: 0, y: 0} to {x: 1, y: 1}
// Canvas Space:        {x: 0, y: h} to {x: w, y: 0}
// Padded Canvas Space: {x: p, y: h-p} to {x: w-p, y: p}
// Color Space:         0 to 256 (Shouldn't it be 255?)
// Data Space:          data.min to data.max
// TODO: We should be able to remove paddedCanvasRange. Just use canvasRange with the included padding. (Wait to change to not confuse variable names in old file)
// const transferFunctionRange = {
//   // Was minLevel and maxLevel
//   min: { x: 0, y: 0 },
//   max: { x: 1, y: 1 },
// };
// const canvasRange = {
//   // Was canvasSpace
//   min: { x: 0, y: undefined },
//   max: { x: undefined, y: 0 },
// };
// const paddedCanvasRange = {
//   // Was paddedCanvasSpace
//   min: { x: canvasPadding, y: undefined },
//   max: { x: undefined, y: canvasPadding },
// };
// const colorRange = {
//   min: 0,
//   max: 256, // Shouldn't this be 255?
// };
// const transformPaddedToCanvas = scaleLinear();
// const transformCanvasToColor = scaleLinear();
// const transformColorToData = scaleLinear();

// TODO - Redraw when dataRange changes
function OpacityControls({ state, setState }) {
  const dataRange = {
    ...state.model.range,
    mid: (state.model.range.min + state.model.range.max) / 2,
  };

  // const {
  //   canvasRef,
  //   scaleTransferFunctionToPaddedCanvasX,
  //   scaleTransferFunctionToPaddedCanvasY,
  //   canvasPoints,
  //   setCanvasPoints,
  //   pointHovering,
  //   setPointHovering,
  //   pointDragging,
  //   setPointDragging,
  //   cursorType,
  //   setCursorType,
  //   mouseStart,
  //   setMouseStart,
  //   pointStart,
  //   setPointStart,
  // } = useCanvas(state, setState);

  // INITIAL RENDER
  useEffect(() => {
    // const canvas = canvasRef.current;
    // // Set ranges
    // canvasRange.max.x = canvas.width;
    // canvasRange.min.y = canvas.height;
    // paddedCanvasRange.max.x = canvas.width - canvasPadding;
    // paddedCanvasRange.min.y = canvas.height - canvasPadding;
    // Set transformations
    // transformPaddedToCanvas
    //   .domain([paddedCanvasRange.min, paddedCanvasRange.max])
    //   .range([canvasRange.min, canvasRange.max]);
    // transformCanvasToColor
    //   .domain([canvasRange.min.x, canvasRange.max.x])
    //   .range([colorRange.min, colorRange.max]);
    // transformColorToData
    //   .domain([colorRange.min, colorRange.max])
    //   .range([dataRange.min, dataRange.max]);
    // scaleTransferFunctionToPaddedCanvasX
    //   .domain([transferFunctionRange.min.x, transferFunctionRange.max.x])
    //   .range([paddedCanvasRange.min.x, paddedCanvasRange.max.x]);
    // scaleTransferFunctionToPaddedCanvasY
    //   .domain([transferFunctionRange.min.y, transferFunctionRange.max.y])
    //   .range([paddedCanvasRange.min.y, paddedCanvasRange.max.y]);
    // Initialize canvas points
    // const points = state.transferFunction.map((p) => {
    //   return {
    //     x: scaleTransferFunctionToPaddedCanvasX(p.x),
    //     y: scaleTransferFunctionToPaddedCanvasY(p.y),
    //   };
    // });
    // setCanvasPoints(points);
    // initCanvasPoints.push(...points);
    // document.addEventListener("mousemove", dragPoint); // was dragPointer
    // document.addEventListener("mouseup", onMouseUp);
    // canvas.addEventListener("mousemove", checkHovering); // was changePointer
    // canvas.addEventListener("mousedown", onMouseDown);
    // canvas.addEventListener("dblclick", addPoint);
    // canvas.addEventListener("contextmenu", removePoint);
    // return () => {
    //   document.removeEventListener("mousemove", dragPoint); // was dragPointer
    //   document.removeEventListener("mouseup", onMouseUp);
    //   canvas.removeEventListener("mousemove", checkHovering); // was changePointer
    //   canvas.removeEventListener("mousedown", onMouseDown);
    //   canvas.removeEventListener("dblclick", addPoint);
    //   canvas.removeEventListener("contextmenu", removePoint);
    // };
  }, []);

  /** EVENT LISTENER FUNCTIONS **/

  // Drag a point
  function dragPoint(e) {
    /** TODO
     * If dragging, setCursorType("dragging")
     */
    e.preventDefault();
    // if(pointHovering) {
    //   console.log("DRAGGING POINT");
    // }
  }

  // Release point
  function onMouseUp(e) {
    // setPointDragging(null);
    // setPointHovering(null)
    // setCursorType("auto")
  }

  // Check to see if cursor is above a point
  function checkHovering(e) {
    // console.log(canvasPoints)
    // canvasPoints.map(p => {
    //   const distance = Math.sqrt(Math.pow(e.offsetX - p.x, 2) + Math.pow(e.offsetY - p.y, 2))
    //   console.log(distance, e.offsetX, p.x, e.offsetY, p.y)
    //   if(p < distance) {
    //     console.log("HOVERING", p, distance)
    //   }
    // })
    // If hovering, setCursorType("drag")
  }

  // If hovering, begin dragging a point
  function onMouseDown(e) {
    // TODO
    // console.log("MOUSE DOWN");
  }

  // Add point to canvas
  function addPoint(e) {
    // TODO
    // console.log("ADD POINT");
  }

  // Remove hovered point - can't be first or last point
  function removePoint(e) {
    e.preventDefault();
    // if (
    //   pointHovering &&
    //   pointHovering != canvasPoints[0] &&
    //   pointHovering != canvasPoints[-1]
    // ) {
    //   setCanvasPoints(canvasPoints.splice(this.pointHovering, 1));
    //   setPointHovering(null);
    // }
  }

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
