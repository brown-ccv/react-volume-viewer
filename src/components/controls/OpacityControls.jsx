import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";
import { DEFAULT_MODEL, SLIDER_RANGE } from "../../constants/constants.js";

/** CONSTANTS **/

const DECIMALS = 2; // Number of decimals to display
const CANVAS_PADDING = 10; // Padding on the canvas
const HOVER_RADIUS = 15; // Pixel offset for registering hovering/clicks
const INIT_CANVAS_POINTS = []; // Starting canvas points, used for reset

/** Data Ranges and Transformations **/

const transferFunctionRange = {
  x: [0, 1],
  y: [0, 1],
};
// {x: p, y: height-p} to {x: width-p, y: p}
const canvasRange = {
  x: [CANVAS_PADDING, undefined],
  y: [undefined, CANVAS_PADDING],
};

// Transform transferFunction to paddedCanvas
const scaleTransferFunctionToPaddedCanvasX = scaleLinear();
const scaleTransferFunctionToPaddedCanvasY = scaleLinear();

// Returns the mouse's  position relative to canvas
function getRelativeMousePos(e) {
  const mouse = {
    x: e.clientX - e.target.getBoundingClientRect().x,
    y: e.clientY - e.target.getBoundingClientRect().y,
  };

  if (mouse.x < canvasRange.x[0]) {
    mouse.x = canvasRange.x[0];
  } else if (mouse.x > canvasRange.x[1]) {
    mouse.x = canvasRange.x[1];
  }

  if (mouse.y > canvasRange.y[0]) {
    mouse.y = canvasRange.y[0];
  } else if (mouse.y < canvasRange.y[1]) {
    mouse.y = canvasRange.y[1];
  }

  return mouse;
}

function OpacityControls({
  state: { transferFunction, model },
  setState,
  initColorMap,
}) {
  const canvasRef = useRef(null);
  const [cursorType, setCursorType] = useState("pointer"); // Cursor type (styled-components)
  const [canvasPoints, setCanvasPoints] = useState([]); // Points in canvas space
  const [pointHovering, setPointHovering] = useState(null); // The point currently moused over
  const [pointDragging, setPointDragging] = useState(null); // The point currently dragging

  /** INITIAL RENDER **/

  useEffect(() => {
    const canvas = canvasRef.current;

    // Set ranges
    canvasRange.x[1] = canvas.width - CANVAS_PADDING;
    canvasRange.y[0] = canvas.height - CANVAS_PADDING;

    // Set transformations
    scaleTransferFunctionToPaddedCanvasX
      .domain(transferFunctionRange.x)
      .range(canvasRange.x);
    scaleTransferFunctionToPaddedCanvasY
      .domain(transferFunctionRange.y)
      .range(canvasRange.y);

    // Initialize canvas points
    const points = transferFunction.map((p) => {
      return {
        x: scaleTransferFunctionToPaddedCanvasX(p.x),
        y: scaleTransferFunctionToPaddedCanvasY(p.y),
      };
    });
    setCanvasPoints(points);
    INIT_CANVAS_POINTS.push(...points);
  }, []);

  /** DRAW FUNCTION **/

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rule on canvas's midpoint

    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 1)";
    context.moveTo(canvas.width / 2, canvas.height);
    context.lineTo(canvas.width / 2, canvas.height - 10);
    context.stroke();

    // Draw lines
    context.beginPath();
    context.strokeStyle = "rgba(128, 128, 128, 0.8)";
    context.lineWidth = 2;
    canvasPoints.map((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();

    // Draw points
    canvasPoints.map((point) => {
      context.beginPath();
      if (pointHovering === point) context.fillStyle = "#FFFF55";
      else context.fillStyle = "#FFAA00";

      context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      context.fill();
    });

    // Update transferFunction
    setState((state) => ({
      ...state,
      transferFunction: canvasPoints.map((p) => {
        return {
          x: scaleTransferFunctionToPaddedCanvasX.invert(p.x),
          y: scaleTransferFunctionToPaddedCanvasY.invert(p.y),
        };
      }),
    }));
  }, [canvasPoints, pointHovering, pointDragging]);

  /** EVENT LISTENER FUNCTIONS **/

  // Check to see if cursor is above a point
  function checkHovering(e) {
    const mouse = getRelativeMousePos(e);
    const point = canvasPoints.find((point) => {
      const distance = Math.sqrt(
        Math.pow(mouse.x - point.x, 2) + Math.pow(mouse.y - point.y, 2)
      );
      return distance < HOVER_RADIUS;
    });

    // Set hovered point and cursor
    setPointHovering(point);
    point ? setCursorType("grab") : setCursorType("pointer");
  }

  // If hovering, begin dragging a point
  function checkDragging(e) {
    e.preventDefault();
    if (pointHovering) {
      setPointDragging(pointHovering);
      setCursorType("grabbing");
    }
  }

  // Drag a point
  function dragPoint(e) {
    e.preventDefault();
    const mousePos = getRelativeMousePos(e);

    // First and last point stay at the start/end of the x axis
    const idx = canvasPoints.findIndex((p) => p === pointDragging);
    if (idx === 0) mousePos.x = canvasRange.x[0];
    else if (idx === canvasPoints.length - 1) mousePos.x = canvasRange.x[1];

    // Remove pointDragging and add current position
    setCanvasPoints(
      [...canvasPoints.filter((p) => p !== pointDragging), mousePos].sort(
        (a, b) => a.x - b.x
      )
    );
    setPointDragging(mousePos);
    setPointHovering(mousePos);
  }

  // Add point to canvas
  function addPoint(e) {
    e.preventDefault();
    setCanvasPoints(
      [...canvasPoints, getRelativeMousePos(e)].sort((a, b) => a.x - b.x)
    );
  }

  // Remove hovered point - can't be first or last
  function removePoint(e) {
    e.preventDefault();
    const idx = canvasPoints.findIndex((p) => p === pointHovering);

    if (idx !== 0 && idx !== canvasPoints.length - 1) {
      setCanvasPoints(canvasPoints.filter((p) => p !== pointHovering));
    }
    setCursorType("pointer");
  }

  // Release point onMouseUp
  function releasePoint(e) {
    e.preventDefault();
    setPointDragging(null);
    pointHovering ? setCursorType("grab") : setCursorType("pointer");
  }

  function leaveCanvas(e) {
    e.preventDefault();
    setPointDragging(null);
    setPointHovering(null);
    setCursorType("inherit");
  }

  function reset() {
    setCanvasPoints(INIT_CANVAS_POINTS);
    setState((state) => ({
      ...state,
      colorMap: initColorMap,
      model: { ...DEFAULT_MODEL, ...model },
      sliders: {
        x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
        y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
        z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      },
    }));
  }

  return (
    <Wrapper>
      <Title>Transfer Function</Title>
      <OutlinedCanvas
        id="opacityControls"
        ref={canvasRef}
        cursor={cursorType}
        onMouseMove={pointDragging ? dragPoint : checkHovering}
        onMouseDown={checkDragging}
        onDoubleClick={addPoint}
        onContextMenu={removePoint}
        onMouseUp={releasePoint}
        onMouseLeave={leaveCanvas}
      />

      <Labels>
        <LabelText>
          {model.range.min.toFixed(DECIMALS)} {model.range.unit}
        </LabelText>

        {model.range.mid && (
          <LabelText>
            {model.range.mid.toFixed(DECIMALS)}
            {model.range.unit}
          </LabelText>
        )}

        <LabelText>
          {model.range.max.toFixed(DECIMALS)} {model.range.unit}
        </LabelText>
      </Labels>

      <HelpText>
        Double-click to add a point to the transfer function. Right-click to
        remove a point. Drag points to change the function.
      </HelpText>
      <Button onClick={reset}>Reset</Button>
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
`;

const Button = styled.button``;

export default OpacityControls;
