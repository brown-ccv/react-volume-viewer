import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";
// import Canvas from "./Canvas.jsx";

/** CONSTANTS **/
const decimals = 2; // Number of decimals to display
const canvasPadding = 10; // Padding on the canvas
const hoverRadius = 15; // Pixel offset for registering hovering/clicks
const initCanvasPoints = []; // Starting canvas points, used for reset

// Data Ranges and Transformations
// Transfer Function:   {x: 0, y: 0} to {x: 1, y: 1}
// Canvas Range:        {x: 0, y: h} to {x: w, y: 0}
// Padded Canvas Range: {x: p, y: h-p} to {x: w-p, y: p}
// Color Range:         0 to 256 (Shouldn't it be 255?)
// Data Range:          data.min to data.max
const transferFunctionRange = {
  min: { x: 0, y: 0 },
  max: { x: 1, y: 1 },
}; // Was minLevel and maxLevel
const colorRange = {
  min: 0,
  max: 256, // Shouldn't this be 255?
};
const canvasRange = {
  min: { x: 0, y: undefined },
  max: { x: undefined, y: 0 },
};
const paddedCanvasRange = {
  min: { x: canvasPadding, y: undefined },
  max: { x: undefined, y: canvasPadding },
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
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }); // Was dragStart [0, 0]
  const [pointStart, setPointStart] = useState({ x: 0, y: 0 }); // Was startPos, [0, 0]
  const dataRange = {
    ...state.model.range,
    mid: (state.model.range.min + state.model.range.max) / 2,
  };

  /** INITIAL RENDER **/

  useEffect(() => {
    const canvas = canvasRef.current;

    // Set ranges
    canvasRange.max.x = canvas.width;
    canvasRange.min.y = canvas.height;
    paddedCanvasRange.max.x = canvas.width - canvasPadding;
    paddedCanvasRange.min.y = canvas.height - canvasPadding;

    // Set transformations
    scaleTransferFunctionToPaddedCanvasX
      .domain([transferFunctionRange.min.x, transferFunctionRange.max.x])
      .range([paddedCanvasRange.min.x, paddedCanvasRange.max.x]);
    scaleTransferFunctionToPaddedCanvasY
      .domain([transferFunctionRange.min.y, transferFunctionRange.max.y])
      .range([paddedCanvasRange.min.y, paddedCanvasRange.max.y]);

    // Initialize canvas points
    const points = state.transferFunction.map((p) => {
      return {
        x: scaleTransferFunctionToPaddedCanvasX(p.x),
        y: scaleTransferFunctionToPaddedCanvasY(p.y),
      };
    });
    setCanvasPoints(points);
    initCanvasPoints.push(...points);

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
    const mousePos = {
      x: e.clientX - e.target.getBoundingClientRect().x,
      y: e.clientY - e.target.getBoundingClientRect().y,
    };

    // Check to see if cursor is above a point
    const point = canvasPoints.find((p) => {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - p.x, 2) + Math.pow(mousePos.y - p.y, 2)
      );
      return distance < hoverRadius;
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

const OutlinedCanvas = styled.canvas`
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

const Button = styled.button``;

export default OpacityControls;
