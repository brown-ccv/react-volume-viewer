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

function App(props) {
  const {
    className,
    style,
    colorMap,
    colorMaps,
    controlsVisible,
    dataRange,
    initTransferFunction,
    path,
    position,
    rotation,
    scale,
    slices,
    spacing,
    useDefaultColorMaps,
    useTransferFunction,
  } = props;
  // console.log("PROPS", props);

  // TODO: colorMaps must have a length >=1 if useDefaultColorMaps is false (?)
  const [state, setState] = useState({
    colorMap:
      colorMap && useTransferFunction ? colorMap : defaultColorMaps.Grayscale,
    transferFunction: useTransferFunction ? initTransferFunction : [],
    sliders: {
      x: [sliderRange.min, sliderRange.max],
      y: [sliderRange.min, sliderRange.max],
      z: [sliderRange.min, sliderRange.max],
    },
  });

  // OVERRIDE colorMap ON PROPS CHANGE
  useEffect(() => {
    setState({
      ...state,
      colorMap:
        colorMap && useTransferFunction ? colorMap : defaultColorMaps.Grayscale,
    });
  }, [colorMap, useTransferFunction]);

  // OVERRIDE transferFunction ON PROPS CHANGE
  useEffect(() => {
    setState({
      ...state,
      transferFunction: useTransferFunction ? initTransferFunction : [],
    });
  }, [useTransferFunction, initTransferFunction]);

  // OVERRIDE sliders ON PROPS CHANGE
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

  // TODO: Add loading spinner centered on scene (could leave in AframeScene?)
  return (
    <Wrapper className={className} style={style}>
      <AframeScene
        state={state}
        useTransferFunction={useTransferFunction}
        model={{ dataRange, path, position, rotation, scale, slices, spacing }}
      />

      {controlsVisible && (
        <Controls
          state={state}
          setState={setState}
          sliderRange={sliderRange}
          dataRange={dataRange}
          colorMaps={
            useDefaultColorMaps
              ? { ...colorMaps, ...defaultColorMaps }
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
