import React from "react";
import styled from "styled-components";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import Section from "./Section.jsx";
import Title from "./Title.jsx";
import { SLIDER_RANGE } from "../../constants";

function ClipControls({ sliders, setSliders }) {
  function handleChange(axis, val) {
    setSliders((sliders) => ({
      ...sliders,
      [axis]: val,
    }));
  }

  return (
    <Section>
      <Title>Clip</Title>
      {["x", "y", "z"].map((axis) => (
        <SliderGroup key={axis}>
          <Axis> {axis.toUpperCase()} Axis</Axis>
          <Range
            min={SLIDER_RANGE.min}
            max={SLIDER_RANGE.max}
            step={0.001}
            value={sliders[axis]}
            allowCross={false}
            onChange={(val) => handleChange(axis, val)}
          />
        </SliderGroup>
      ))}
    </Section>
  );
}

const SliderGroup = styled.div``;

const Axis = styled.h4`
  margin: 8px 0;
`;

export default ClipControls;
