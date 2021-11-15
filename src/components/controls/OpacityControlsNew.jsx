import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";

// Constants
// TODO: min and max level
const canvasHeight = 70;
const hoverRadius = 15; // Pixel offset for registering hovering/clicks

function OpacityControls({ state, setState, dataRange }) {
  // Canvas state
  const canvasRef = useRef(null);
  // TODO: Note that these can become the transfer function index
  const [pointDragging, setPointDragging] = useState(null);
  const [pointHovering, setPointHovering] = useState(null);

  // Initial render
  useEffect(() => {
    // Get canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

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
        {/* <LabelText>
          {dataRange.min.toFixed(this.displayedDecimals)} {dataRange.units}
        </LabelText>
        <LabelText>
          {dataRange.mid.toFixed(this.displayedDecimals)} {dataRange.units}
        </LabelText>
        <LabelText>
          {dataRange.max.toFixed(this.displayedDecimals)} {dataRange.units}
        </LabelText> */}
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
  width: 250px;
`;

const LabelText = styled.p`
  font-weight: bold;
  margin: 0;
  font-size: 11px;
`;

export default OpacityControls;
