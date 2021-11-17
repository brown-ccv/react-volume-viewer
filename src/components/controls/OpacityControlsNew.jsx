import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";

// Constants
const canvasPadding = 10; // Padding on the canvas
const hoverRadius = 15; // Pixel offset for registering hovering/clicks
const decimals = 2; // Number of decimals to display in labels

// Data Ranges and Transformations
// Transfer Function:   {x: 0, y: 0} to {x: 1, y: 1}
// Canvas Space:        {x: 0, y: h} to {x: w, y: 0}
// Padded Canvas Space: {x: p, y: h-p} to {x: w-p, y: p}
// Color Space:         0 to 256 (Shouldn't it be 255?)
// Data Space:          data.min to data.max
// TODO: We should be able to remove paddedCanvasRange. Just use canvasRange with the included padding. (Wait to change to not confuse variable names in old file)
const transferFunctionRange = {
  // Was minLevel and maxLevel
  min: { x: 0, y: 0 },
  max: { x: 1, y: 1 },
};
const canvasRange = {
  // Was canvasSpace
  min: { x: 0, y: undefined },
  max: { x: undefined, y: 0 },
};
const paddedCanvasRange = {
  // Was paddedCanvasSpace
  min: { x: canvasPadding, y: undefined },
  max: { x: undefined, y: canvasPadding },
};
const colorRange = {
  min: 0,
  max: 256, // Shouldn't this be 255?
};
const transformPaddedToCanvas = scaleLinear();
const transformCanvasToColor = scaleLinear();
const transformColorToData = scaleLinear();

// Transform transferFunction to paddedCanvas
const scaleTransferFunctionToPaddedCanvasX = scaleLinear();
const scaleTransferFunctionToPaddedCanvasY = scaleLinear();

// TODO - Redraw when dataRange changes
// TODO - dataRange has been renamed in main (state.model.range)
function OpacityControls({ state, setState, dataRange }) {
  const canvasRef = useRef(null);
  // const [canvasPoints, setCanvasPoints] = useState([]); // Was nodesCanvasSpace
  const [pointDragging, setPointDragging] = useState(null); // TODO: This will become a specific point
  const [pointHovering, setPointHovering] = useState(null); // TODO: This will become a specific point
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }); // Was dragStart [0, 0]
  const [pointStart, setPointStart] = useState({ x: 0, y: 0 }); // Was startPos, [0, 0]

  // INITIAL RENDER
  useEffect(() => {
    const canvas = canvasRef.current;

    // Set ranges
    canvasRange.max.x = canvas.width;
    canvasRange.min.y = canvas.height;
    paddedCanvasRange.max.x = canvas.width - canvasPadding;
    paddedCanvasRange.min.y = canvas.height - canvasPadding;

    // Set transformations
    // transformPaddedToCanvas
    //   .domain([paddedCanvasRange.min, paddedCanvasRange.max])
    //   .range([canvasRange.min, canvasRange.max]);
    transformCanvasToColor
      .domain([canvasRange.min.x, canvasRange.max.x])
      .range([colorRange.min, colorRange.max]);
    transformColorToData
      .domain([colorRange.min, colorRange.max])
      .range([dataRange.min, dataRange.max]);

    scaleTransferFunctionToPaddedCanvasX
      .domain([transferFunctionRange.min.x, transferFunctionRange.max.x])
      .range([paddedCanvasRange.min.x, paddedCanvasRange.max.x]);
    scaleTransferFunctionToPaddedCanvasY
      .domain([transferFunctionRange.min.y, transferFunctionRange.max.y])
      .range([paddedCanvasRange.min.y, paddedCanvasRange.max.y]);

    // Add event listeners
    document.addEventListener("mousemove", dragPoint); // was dragPointer
    document.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", changePoint); // was changePointer
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("dblclick", addPoint);
    canvas.addEventListener("contextmenu", removePoint);

    // Remove event listeners
    return () => {
      document.removeEventListener("mousemove", dragPoint); // was dragPointer
      document.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", changePoint); // was changePointer
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("dblclick", addPoint);
      canvas.removeEventListener("contextmenu", removePoint);
    };
  }, []);

  // Update canvasPoints and redraw whenever transferFunction changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Update canvas points
    // TODO: Need to include padding (conversion from canvas height and width to padded height and width)
    const points = [];
    state.transferFunction.forEach((p) => {
      points.push({
        x: scaleTransferFunctionToPaddedCanvasX(p.x),
        y: scaleTransferFunctionToPaddedCanvasY(p.y),
      });
    });
    // setCanvasPoints(points)
    const canvasPoints = points;
    console.log("POINTS", points, state.transferFunction);

    // Draw border
    canvas.style.border = "1px solid";
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rule on canvas's midpoint
    const middle = canvas.width / 2;
    context.moveTo(middle, canvas.height);
    context.lineTo(middle, canvas.height - 10);
    context.stroke();

    // TODO: Can we draw these in only one loop?

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
  }, [state.transferFunction]);

  // Event Listener Functions
  function dragPoint(e) {
    // TODO
    e.preventDefault();
    console.log("DRAGGING POINT");
  }
  function onMouseUp(e) {
    console.log("MOUSE UP");
    setPointDragging(null);
  }
  function changePoint(e) {
    // TODO
    console.log("CHANGING POINT");
  }
  function onMouseDown(e) {
    // TODO
    console.log("MOUSE DOWN");
  }
  function addPoint(e) {
    // TODO
    console.log("ADD POINT");
  }
  function removePoint(e) {
    // TODO
    console.log("REMOVE POINT");
  }

  // Functions
  function reset() {
    console.log("RESET");
  }

  return (
    <Wrapper>
      <Title>Transfer Function</Title>
      <canvas ref={canvasRef} id="opacityControls" />
      <Labels>
        <LabelText>
          {dataRange.min.toFixed(decimals)} {dataRange.units}
        </LabelText>
        <LabelText>
          {dataRange.mid.toFixed(decimals)} {dataRange.units}
        </LabelText>
        <LabelText>
          {dataRange.max.toFixed(decimals)} {dataRange.units}
        </LabelText>
      </Labels>

      <p>
        Double-click to add a point to the transfer function. Right-click to
        remove a point. Drag points to change the function.
      </p>
      <Button onClick={() => reset()}> Reset </Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 25px 0;
`;

const Button = styled.button``;

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

export default OpacityControls;
