import React from "react";
import styled from "styled-components";
import {
  Listbox,
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
  ListboxArrow,
  ListboxGroup,
  ListboxGroupLabel,
} from "@reach/listbox";
import "@reach/listbox/styles.css";

import Title from "./SectionTitle.jsx";

const StyledListboxInput = styled(ListboxInput)`
  width: 100%;

  > [data-reach-listbox-button] {
    padding: 0;

    > [data-reach-listbox-arrow] {
      margin: auto;
    }
  }
`;

export default function ColorMapControls({ state, setState, colorMaps }) {
  function handleChange(color) {
    setState({
      ...state,
      colorMap: colorMaps.find((colorMap) => colorMap.name === color),
    });
  }

  return (
    <div>
      <Title>Color Map</Title>
      <StyledListboxInput
        aria-labelledby="ColorMap dropdown"
        value={state.colorMap.name}
        onChange={(color) => handleChange(color)}
      >
        <ListboxButton>
          <img
            src={state.colorMap.src}
            alt={state.colorMap.name}
            height="20px"
            width="95%"
          />
          <ListboxArrow />
        </ListboxButton>
        <ListboxPopover>
          <ListboxList>
            {colorMaps.map((color) => (
              <ListboxOption key={color.name} value={color.name}>
                <img
                  src={color.src}
                  alt={color.name}
                  height="15px"
                  width="100%"
                />
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </StyledListboxInput>
    </div>
  );
}
