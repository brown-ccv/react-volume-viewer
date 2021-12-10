import React from "react";
import styled from "styled-components";

import { DEFAULT_MODEL, SLIDER_RANGE } from "../../constants/constants.js";

function ButtonControls({
  setState,
  initColorMap,
  initCanvasPoints,
  setCanvasPoints
}) {
  // Reset sliders and set colorMap and model to props
  function reset() {
    setCanvasPoints(initCanvasPoints);
    setState((state) => ({
      ...state,
      colorMap: initColorMap,
      model: { ...DEFAULT_MODEL, ...state.model },
      sliders: {
        x: [SLIDER_RANGE.min, SLIDER_RANGE.max],
        y: [SLIDER_RANGE.min, SLIDER_RANGE.max],
        z: [SLIDER_RANGE.min, SLIDER_RANGE.max],
      },
    }));
  }

  function setFullscreen() {
    setState(state => ({
      ...state,
      embedded: true
    }))
  }

  return (
    <Wrapper>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={setFullscreen}>Fullscreen</Button>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Button = styled.button``;

export default ButtonControls;
