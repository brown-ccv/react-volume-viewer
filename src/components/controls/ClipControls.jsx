import React from "react";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import Title from "./SectionTitle.jsx";

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
        <div key={axis}>
          <h4> {axis.toUpperCase()} Axis</h4>
          <Range
            min={sliderRange.min}
            max={sliderRange.max}
            step={0.001}
            value={state.sliders[axis]}
            allowCross={false}
            onChange={(val) => handleChange(axis, val)}
          />
        </div>
      ))}
    </div>
  );
}
