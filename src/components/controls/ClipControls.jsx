import React from "react";
import styled from "styled-components";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import Title from "./SectionTitle.jsx";

const SliderGroup = styled.div``;

export default function ClipControls({ state, setState, sliderRange }) {
  function handleChange(axis, val) {
    setState({
      ...state,
      sliders: {
        ...state.sliders,
        [axis]: val,
      },
    });
  }

  return (
    <div>
      <Title>Clip</Title>
      {["x", "y", "z"].map((axis) => (
        <SliderGroup key={axis}>
          <h4> {axis.toUpperCase()} Axis</h4>
          <Range
            min={sliderRange.min}
            max={sliderRange.max}
            step={0.001}
            value={state.sliders[axis]}
            allowCross={false}
            onChange={(val) => handleChange(axis, val)}
          />
        </SliderGroup>
      ))}
    </div>
  );
}
