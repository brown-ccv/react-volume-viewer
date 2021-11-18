import React, { useState, useEffect } from "react";
import styled from "styled-components";

import grayscale from "../assets/grayscale.png";
import natural from "../assets/natural.png";
import rgb from "../assets/rgb.png";

import Controls from "./controls/Controls.jsx";
import AframeScene from "./AframeScene.jsx";

const sliderRange = { min: 0, max: 1 };
const defaultColorMaps = {
  Grayscale: grayscale,
  Natural: natural,
  RGB: rgb,
};
const defaultModel = {
  position: "0 0 0",
  range: { min: 0, max: 1, unit: "" },
  rotation: "0 0 0",
  scale: "1 1 1",
  slices: 55,
  spacing: { x: 2, y: 2, z: 1 },
};

function App(props) {
  const {
    className,
    style,
    colorMap,
    colorMaps,
    controlsVisible,
    model,
    transferFunction,
    useDefaultColorMaps,
    useTransferFunction,
  } = props;

  const [state, setState] = useState({
    model: { ...defaultModel, ...model },
    colorMap:
      colorMap && useTransferFunction ? colorMap : defaultColorMaps.Grayscale,
    transferFunction: useTransferFunction ? transferFunction : [],
    sliders: {
      x: [sliderRange.min, sliderRange.max],
      y: [sliderRange.min, sliderRange.max],
      z: [sliderRange.min, sliderRange.max],
    },
  });

  // Change model on props change
  useEffect(() => {
    setState({
      ...state,
      model: { ...defaultModel, ...model },
    });
  }, [model]);

  // Override colorMap on props change
  useEffect(() => {
    setState({
      ...state,
      colorMap:
        colorMap && useTransferFunction ? colorMap : defaultColorMaps.Grayscale,
    });
  }, [colorMap, useTransferFunction]);

  // Override transferFunction on prop change
  useEffect(() => {
    setState({
      ...state,
      transferFunction: useTransferFunction ? transferFunction : [],
    });
  }, [useTransferFunction, transferFunction]);

  // Override sliders on prop change
  useEffect(() => {
    setState({
      ...state,
      sliders: {
        x: [sliderRange.min, sliderRange.max],
        y: [sliderRange.min, sliderRange.max],
        z: [sliderRange.min, sliderRange.max],
      },
    });
  }, [sliderRange]);

  return (
    <Wrapper className={className} style={style}>
      <AframeScene state={state} useTransferFunction={useTransferFunction} />

      {controlsVisible && (
        <Controls
          state={state}
          setState={setState}
          sliderRange={sliderRange}
          colorMaps={
            useDefaultColorMaps
              ? { ...defaultColorMaps, ...colorMaps }
              : colorMaps
          }
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
`;

export default App;
