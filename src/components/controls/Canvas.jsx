import React, { useRef, useState, useEffect, useCallback } from "react";
import { scaleLinear } from "d3-scale";
import styled from "styled-components";

/** CONSTANTS **/
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

function Canvas({ state, setState }) {
  const canvasRef = useRef(null); // Reference to the canvas
  const [cursorType, setCursorType] = useState("auto"); // Type of curser over the canvas
  const [canvasPoints, setCanvasPoints] = useState([]); // Points on the canvas

  const [pointHovering, setPointHovering] = useState(null); // Index of the point currently moused over
  const [pointDragging, setPointDragging] = useState(null); // Index of the point currently dragging
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }); // Was dragStart [0, 0]
  const [pointStart, setPointStart] = useState({ x: 0, y: 0 }); // Was startPos, [0, 0]

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
    // canvasPoints.concat(points)
    initCanvasPoints.push(...points);

    document.addEventListener("mousemove", dragPoint); // was dragPointer
    document.addEventListener("mouseup", onMouseUp);

    // canvas.addEventListener("mousedown", onMouseDown);
    // canvas.addEventListener("dblclick", addPoint);
    // canvas.addEventListener("contextmenu", removePoint);

    return () => {
      document.removeEventListener("mousemove", dragPoint); // was dragPointer
      document.removeEventListener("mouseup", onMouseUp);
      // canvas.removeEventListener("mousedown", onMouseDown);
      // canvas.removeEventListener("dblclick", addPoint);
      // canvas.removeEventListener("contextmenu", removePoint);
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
    const canvasPos = e.target.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - canvasPos.x,
      y: e.clientY - canvasPos.y,
    };

    // Check to see if cursor is above a point
    setPointHovering(
      canvasPoints.find((p) => {
        const distance = Math.sqrt(
          Math.pow(mousePos.x - p.x, 2) + Math.pow(mousePos.y - p.y, 2)
        );
        return distance < hoverRadius;
      })
    );
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
    <OutlinedCanvas
      id="opacityControls"
      ref={canvasRef}
      cursor={cursorType}
      onMouseMove={checkHovering}
      onMouseDown={onMouseDown}
      onDoubleClick={addPoint}
      onContextMenu={removePoint}
    />
  );
}

const OutlinedCanvas = styled.canvas`
  outline: 1px solid;
  cursor: ${(props) => props.cursor};
`;

export default Canvas;
