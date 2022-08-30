import React, { memo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Section from "./Section.jsx";
import Title from "./Title.jsx";

/** Constants */

const DECIMALS = 2;
const CANVAS_PADDING = 10;
const HOVER_RADIUS = 15;

/** Data Ranges and Transformations **/

const transferFunctionRange = {
  x: [0, 1],
  y: [0, 1],
};
const canvasRange = {
  x: [CANVAS_PADDING, undefined], // Padding to width - padding
  y: [undefined, CANVAS_PADDING], // Height - padding to padding
};

// Transform transferFunction space to canvas space
const scaleTransferFunctionToCanvasX = scaleLinear();
const scaleTransferFunctionToCanvasY = scaleLinear();

/** Helper Function */

// Returns the mouse's  position relative to canvas
function getRelativeMousePos(e) {
  const position = {
    x: e.clientX - e.target.getBoundingClientRect().x,
    y: e.clientY - e.target.getBoundingClientRect().y,
  };

  // Clamp to the canvas padding
  position.x = Math.min(
    Math.max(position.x, canvasRange.x[0]),
    canvasRange.x[1]
  );
  position.y = Math.max(
    Math.min(position.y, canvasRange.y[0]),
    canvasRange.y[1]
  );

  return position;
}

function TransferFunctionControls({
  transferFunction,
  range,
  colorMapPath,
  setTransferFunction,
}) {
  // TODO: I think these can all be refs?
  const canvasRef = useRef(null);
  const [pointHovering, setPointHovering] = useState(null); // The point currently moused over
  const [pointDragging, setPointDragging] = useState(null); // The point currently dragging
  const [cursorType, setCursorType] = useState("pointer"); // Cursor type (styled-components)

  // TODO: Consolidated state
  // Combine transfer function and canvas points into a single state variable
  // Need to make sure I update both setTransferFunction and points.transferFunction at the same time
  // Add a useEffect that takes points and TF, checks if same and to manage updates to re-renders
  const [points, setPoints] = useState({
    transferFunction: transferFunction,
    canvas: null
  });
  const initUpdate = useRef(true);

  /** INITIAL RENDER **/

  useEffect(() => {
    console.log(
      "INIT",
      transferFunction.length,
      points.transferFunction.length,
      points.canvas?.length
    );
    const canvas = canvasRef.current;

    // Set ranges and transformations
    canvasRange.x[1] = canvas.width - CANVAS_PADDING;
    canvasRange.y[0] = canvas.height - CANVAS_PADDING;
    scaleTransferFunctionToCanvasX
      .domain(transferFunctionRange.x)
      .range(canvasRange.x);
    scaleTransferFunctionToCanvasY
      .domain(transferFunctionRange.y)
      .range(canvasRange.y);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** DRAW CANVAS **/

  // Should be: "INIT 3 0", "DRAW 3 3", [no SET]
  useEffect(() => {
    if (initUpdate.current) return;

    console.log(
      "DRAW",
      transferFunction.length,
      points.transferFunction.length,
      points.canvas.length
    );
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw midpoint tick on the axis
    context.beginPath();
    context.strokeStyle = "rgb(0, 0, 0)";
    context.lineWidth = 1;
    context.moveTo(canvas.width / 2, canvas.height);
    context.lineTo(canvas.width / 2, canvas.height - CANVAS_PADDING);
    context.stroke();

    // Draw transfer function
    context.fillStyle = "rgb(233, 233, 233)";
    context.strokeStyle = "rgb(45, 183, 245)";
    context.lineWidth = 2;

    // Lines
    context.beginPath();
    points.canvas.forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();

    // Points
    context.beginPath();
    points.canvas.forEach((point) => {
      context.moveTo(point.x, point.y);
      context.arc(
        point.x,
        point.y,
        pointHovering === point ? 8 : 5,
        0,
        2 * Math.PI
      );
    });
    context.stroke();
    context.fill();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.canvas, pointHovering, pointDragging]);


  /* UPDATE TRANSFER FUNCTION */

  useEffect(() => {
    if (initUpdate.current) return;
    console.log(
      "TF",
      transferFunction.length,
      points.transferFunction.length,
      points.canvas.length
    );
    const newTransferFunction = points.canvas.map((p) => ({
      x: scaleTransferFunctionToCanvasX.invert(p.x),
      y: scaleTransferFunctionToCanvasY.invert(p.y),
    }));
    setPoints((points) => ({
      ...points,
      transferFunction: newTransferFunction,
    }));
    setTransferFunction(newTransferFunction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.canvas]);


  /* UPDATE CANVAS POINTS */

  useEffect(() => {
    // Initialize canvasPoints
    setPoints((points) => ({
      ...points,
      canvas: transferFunction.map((p) => ({
        x: scaleTransferFunctionToCanvasX(p.x),
        y: scaleTransferFunctionToCanvasY(p.y),
      })),
    }));
    initUpdate.current = false;
  }, [])


  /** EVENT LISTENER FUNCTIONS **/

  // Check to see if cursor is above a point - change cursor if so
  function checkHovering(e) {
    const relativeMouse = getRelativeMousePos(e);
    const point = points.canvas.find((point) => {
      const distance = Math.sqrt(
        Math.pow(relativeMouse.x - point.x, 2) +
        Math.pow(relativeMouse.y - point.y, 2)
      );
      return distance < HOVER_RADIUS;
    });

    setPointHovering(point);
    point ? setCursorType("grab") : setCursorType("pointer");
  }

  // Check to see if cursor should start dragging a point
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
    const newPoint = getRelativeMousePos(e);

    const idx = points.canvas.findIndex((p) => p === pointDragging);
    if (idx === 0) newPoint.x = canvasRange.x[0];
    else if (idx === points.canvas.length - 1) newPoint.x = canvasRange.x[1];

    setPoints((points) => ({
      ...points,
      canvas: [
        ...points.canvas.filter((p) => p !== pointDragging),
        newPoint,
      ].sort((a, b) => a.x - b.x),
    }));
    setPointDragging(newPoint);
    setPointHovering(newPoint);
  }

  // Add point to canvas
  // TODO: This takes a super long time?
  function addPoint(e) {
    e.preventDefault();
    setPoints((points) => ({
      ...points,
      canvas: [...points.canvas, getRelativeMousePos(e)].sort(
        (a, b) => a.x - b.x
      ),
    }));
  }

  // Remove hovered point - can't be first or last
  function removePoint(e) {
    e.preventDefault();
    const idx = points.canvas.findIndex((p) => p === pointHovering);

    if (idx !== 0 && idx !== points.canvas.length - 1) {
      setPoints((points) => ({
        ...points,
        canvas: points.canvas.filter((p) => p !== pointHovering),
      }));
    }
    setCursorType("pointer");
  }

  // Release point onMouseUp
  function releasePoint(e) {
    e.preventDefault();
    setPointDragging(null);
    pointHovering ? setCursorType("grab") : setCursorType("pointer");
  }

  // Stop point interaction when cursor leaves the canvas
  function leaveCanvas(e) {
    e.preventDefault();
    setPointDragging(null);
    setPointHovering(null);
    setCursorType("inherit");
  }

  return (
    <Section>
      <Title>Transfer Function</Title>
      <CanvasContainer cursor={cursorType}>
        <CanvasBackground src={colorMapPath} />
        <Canvas
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
      </CanvasContainer>

      <Labels>
        <LeftLabel>
          {range.min.toFixed(DECIMALS)} {range.unit}
        </LeftLabel>

        <CenterLabel>
          {((range.min + range.max) / 2).toFixed(DECIMALS)} {range.unit}
        </CenterLabel>

        <RightLabel>
          {range.max.toFixed(DECIMALS)} {range.unit}
        </RightLabel>
      </Labels>

      <HelpText>
        Double-click to add a point to the transfer function. Right-click to
        remove a point. Drag points to change the function.
      </HelpText>
    </Section>
  );
}

const CanvasContainer = styled.div`
  position: relative;
  outline: 1px solid;
`;

const CanvasBackground = styled.div`
  background-image: url(${(props) => props.src});
  background-size: contain;
  opacity: 0.3;
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
`;

const Canvas = styled.canvas`
  position: relative;
  display: block;
  width: 100%;
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
  width: 33%;
`;

const LeftLabel = styled(LabelText)`
  text-align: left;
`;

const CenterLabel = styled(LabelText)`
  text-align: center;
`;

const RightLabel = styled(LabelText)`
  text-align: right;
`;

const HelpText = styled.p`
  margin: 5px 0;
  font-size: 0.75rem;
`;

export default memo(TransferFunctionControls);
