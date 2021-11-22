import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";

/** CONSTANTS **/
const DECIMALS = 2; // Number of decimals to display
const CANVAS_PADDING = 10; // Padding on the canvas
const HOVER_RADIUS = 15; // Pixel offset for registering hovering/clicks
const INIT_CANVAS_POINTS = []; // Starting canvas points, used for reset

// Data Ranges and Transformations
// Transfer Function:   {x: 0, y: 0} to {x: 1, y: 1}
// Canvas Range:        {x: 0, y: h} to {x: w, y: 0}
// Padded Canvas Range: {x: p, y: h-p} to {x: w-p, y: p}
// Color Range:         0 to 256 (Shouldn't it be 255?)
// Data Range:          data.min to data.max
const colorRange = {
  min: 0,
  max: 256, // Shouldn't this be 255?
};
const transferFunctionRange = {
  x: [0, 1],
  y: [0, 1],
}; // Was minLevel and maxLevel

const canvasRange = {
  x: [0, undefined],
  y: [undefined, 0],
};
const paddedCanvasRange = {
  x: [CANVAS_PADDING, undefined],
  y: [undefined, CANVAS_PADDING],
};

// Transform transferFunction to paddedCanvas
const scaleTransferFunctionToPaddedCanvasX = scaleLinear();
const scaleTransferFunctionToPaddedCanvasY = scaleLinear();

function OpacityControls({ state, setState }) {
  const canvasRef = useRef(null); // Reference to the canvas
  const [cursorType, setCursorType] = useState("auto"); // Type of curser over the canvas
  const [canvasPoints, setCanvasPoints] = useState([]); // Points on the canvas

  const [pointHovering, setPointHovering] = useState(null); // Index of the point currently moused over
  const [pointDragging, setPointDragging] = useState(null); // Index of the point currently dragging
  const [mouseStart, setMouseStart] = useState({}); // Was dragStart [0, 0], will be { x: 0, y: 0 }
  const [pointStart, setPointStart] = useState({}); // Was startPos, [0, 0], will be { x: 0, y: 0 }
  const dataRange = {
    ...state.model.range,
    mid: (state.model.range.min + state.model.range.max) / 2,
  };

  /** INITIAL RENDER **/

  useEffect(() => {
    const canvas = canvasRef.current;

    // Set ranges
    canvasRange.x[1] = canvas.width;
    canvasRange.y[0] = canvas.height;
    paddedCanvasRange.x[1] = canvas.width - CANVAS_PADDING;
    paddedCanvasRange.y[0] = canvas.height - CANVAS_PADDING;

    // Set transformations
    scaleTransferFunctionToPaddedCanvasX
      .domain(transferFunctionRange.x)
      .range(paddedCanvasRange.x);
    scaleTransferFunctionToPaddedCanvasY
      .domain(transferFunctionRange.y)
      .range(paddedCanvasRange.y);

    // Initialize canvas points
    const points = state.transferFunction.map((p) => {
      return {
        x: scaleTransferFunctionToPaddedCanvasX(p.x),
        y: scaleTransferFunctionToPaddedCanvasY(p.y),
      };
    });
    setCanvasPoints(points);
    INIT_CANVAS_POINTS.push(...points);

    document.addEventListener("mousemove", dragPoint); // was dragPointer
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", dragPoint); // was dragPointer
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  /** DRAW FUNCTION **/

  useEffect(() => {
    console.log("DRAWING", canvasPoints);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    console.log("SIZE", canvas.width, canvas.height)

    // Reset and Draw rule on canvas's midpoint
    context.clearRect(0, 0, canvas.width, canvas.height);
    const middle = canvas.width / 2;
    context.moveTo(middle, canvas.height);
    context.lineTo(middle, canvas.height - 10);
    context.stroke();

    // Draw lines
    context.strokeStyle = "rgba(128, 128, 128, 0.8)";
    context.lineWidth = 2;
    context.beginPath();
    for (let i = 0; i < canvasPoints.length - 1; i++) {
      context.moveTo(canvasPoints[i].x, canvasPoints[i].y);
      context.lineTo(canvasPoints[i + 1].x, canvasPoints[i + 1].y);
      context.stroke();
    }

    // Draw points
    context.strokeStyle = "#AAAAAA";
    context.lineWidth = 2;
    canvasPoints.map((point) => {
      if (pointHovering === point) context.fillStyle = "#FFFF55";
      else context.fillStyle = "#FFAA00";

      context.beginPath();
      context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      context.fill();
    });

    // Update transferFunction
    setState({
      ...state,
      transferFunction: canvasPoints.map((p) => {
        return {
          x: scaleTransferFunctionToPaddedCanvasX.invert(p.x),
          y: scaleTransferFunctionToPaddedCanvasY.invert(p.y),
        };
      }),
    });
  }, [canvasPoints, pointHovering, pointDragging]);

  /** EVENT LISTENER FUNCTIONS **/

  function checkHovering(e) {
    // Mouse position relative to canvas
    const mouse = {
      x: e.clientX - e.target.getBoundingClientRect().x,
      y: e.clientY - e.target.getBoundingClientRect().y,
    };

    // Check to see if cursor is above a point
    const point = canvasPoints.find((point) => {
      const distance = Math.sqrt(
        Math.pow(mouse.x - point.x, 2) + Math.pow(mouse.y - point.y, 2)
      );
      return distance < HOVER_RADIUS;
    });

    // Set hovered point and cursor
    setPointHovering(point);
    point ? setCursorType("grab") : setCursorType("auto");
  }

  // Drag a point
  function dragPoint(e) {}

  // Release point
  function onMouseUp(e) {}

  // If hovering, begin dragging a point
  function onMouseDown(e) {
    // TODO
    // console.log("MOUSE DOWN");
  }

  // Add point to canvas
  function addPoint(e) {}

  // Remove hovered point - can't be first or last point
  function removePoint(e) {}

  return (
    <Wrapper>
      <Title>Transfer Function</Title>
      <OutlinedCanvas
        id="opacityControls"
        ref={canvasRef}
        cursor={cursorType}
        onMouseMove={checkHovering}
        onMouseDown={onMouseDown}
        onDoubleClick={addPoint}
        onContextMenu={removePoint}
      />

      <Labels>
        <LabelText>
          {dataRange.min.toFixed(DECIMALS)} {dataRange.unit}
        </LabelText>
        <LabelText>
          {dataRange.mid.toFixed(DECIMALS)}
          {dataRange.unit}
        </LabelText>
        <LabelText>
          {dataRange.max.toFixed(DECIMALS)} {dataRange.unit}
        </LabelText>
      </Labels>

      <HelpText>
        Double-click to add a point to the transfer function. Right-click to
        remove a point. Drag points to change the function.
      </HelpText>
      <Button onClick={() => setCanvasPoints(INIT_CANVAS_POINTS)}>
        {" "}
        Reset{" "}
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 25px 0;
`;

const OutlinedCanvas = styled.canvas`
  width: 100%;
  outline: 1px solid;
  cursor: ${(props) => props.cursor};
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

const HelpText = styled.p`
  margin: 5px 0;
`
const Button = styled.button`
`;

export default OpacityControls;
