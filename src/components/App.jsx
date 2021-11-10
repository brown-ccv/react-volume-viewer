import React, { useEffect } from "react";
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

const Wrapper = styled.div`
  position: relative;
  isolation: isolate;
`;

export default function App(props) {
  // Prop changes should cause re-render automatically
  const {
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
  console.log("PROPS", props);

  // TODO: If not useTransferFunction, set colorMaps to only grayscale
  // TODO: colorMaps must have a length >=1 if useDefaultColorMaps is false (?)

  const [state, setState] = React.useState({
    colorMap:
      colorMap && useTransferFunction ? colorMap : defaultColorMaps.Grayscale,
    transferFunction: useTransferFunction ? initTransferFunction : null,
    sliders: {
      x: [sliderRange.min, sliderRange.max],
      y: [sliderRange.min, sliderRange.max],
      z: [sliderRange.min, sliderRange.max],
    },
  });

  // TODO: Add loading spinner centered on scene (could leave in AframeScene?)
  return (
    <Wrapper className={props.className} style={props.style}>
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
