import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";

// Constants
// TODO: min and max level
const canvasPadding = 10;
const hoverRadius = 15; // Pixel offset for registering hovering/clicks
const decimals = 2; // Number of decimals to display in labels

// Data Ranges and transformations
// TODO: Should be able to remove paddedCanvasRange. Just use canvasRange with the included padding. (Wait to change to not confuse variable names in old file)
const canvasRange = {
  min: 0,
  max: undefined,
}; // Min and max values of the canvas. Was canvasSpace
const paddedCanvasRange = {
  min: canvasPadding,
  max: undefined,
}; // Min and max values of drawn canvas. Was paddedCanvasSpace
const colorRange = {
  min: 0,
  max: 256, // TODO: Shouldn't this be 255?
}; // Range of possible colors. Was colorSpace
const transformPaddedToCanvas = scaleLinear();
const transformCanvasToColor = scaleLinear();
const transformColorToData = scaleLinear();

// TODO - Redraw when dataRange changes
function OpacityControls({ state, setState, dataRange }) {
  const canvasRef = useRef(null);
  const [canvasPoints, setCanvasPoints] = useState([]); // Was nodesCanvasSpace
  const [pointDragging, setPointDragging] = useState(null); // TODO: These will become the transfer function index
  const [pointHovering, setPointHovering] = useState(null); // TODO: These will become the transfer function index
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }); // Was dragStart [0, 0]
  const [pointStart, setPointStart] = useState({ x: 0, y: 0 }); // Was startPos, [0, 0]

  // INITIAL RENDER
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.style.border = "1px solid";

    // Set ranges
    canvasRange.max = canvas.width;
    paddedCanvasRange.max = canvas.width - canvasPadding;

    // Set transformations
    transformPaddedToCanvas
      .domain([paddedCanvasRange.min.paddedCanvasRange.max])
      .range([canvasRange.min, canvasRange.max]);
    transformCanvasToColor
      .domain([canvasRange.min, canvasRange.max])
      .range([colorRange.min, colorRange.max]);
    transformColorToData
      .domain([colorRange.min, colorRange.max])
      .range([dataRange.min, dataRange.max]);

    // Add event listeners
    document.addEventListener("mousemove", dragPoint); // was dragPointer
    document.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", changePoint); // was changePointer
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("dblclick", addPoint);
    canvas.addEventListener("contextmenu", removePoint);

    return () => {
      // Remove event listeners
      document.removeEventListener("mousemove", dragPoint); // was dragPointer
      document.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", changePoint); // was changePointer
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("dblclick", addPoint);
      canvas.removeEventListener("contextmenu", removePoint);
    };
  }, []);

  // Re-draw canvas when transferFunction changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // TODO: Use initTransferFunction to build canvas points
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
