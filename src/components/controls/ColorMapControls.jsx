import React from "react";
import styled from "styled-components";
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
  ListboxArrow,
} from "@reach/listbox";
import "@reach/listbox/styles.css";

import Title from "./SectionTitle.jsx";

function ColorMapControls(props) {
  const {
    state: { colorMap },
    setState,
    colorMaps,
  } = props;
  return (
    <Wrapper>
      <Title>Color Map</Title>

      <StyledListboxInput
        aria-labelledby="ColorMap dropdown"
        value={colorMap.name}
        onChange={(color) =>
          setState((state) => ({ ...state, colorMap: colorMaps[color] }))
        }
      >
        <ListboxButton>
          <img
            src={colorMap}
            alt="The current color map"
            height="20px"
            width="95%"
          />
          <ListboxArrow />
        </ListboxButton>
        <ListboxPopover>
          <ListboxList>
            {Object.keys(colorMaps).map((color) => (
              <ListboxOption key={color} value={color}>
                <img
                  src={colorMaps[color]}
                  alt={color}
                  height="15px"
                  width="100%"
                />
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </StyledListboxInput>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 25px 0;
  margin-top: 0;
`;

const StyledListboxInput = styled(ListboxInput)`
  width: 100%;

  > [data-reach-listbox-button] {
    width: 100%;
    padding: 0;
    border: 0;
    outline: solid 1px;

    > [data-reach-listbox-arrow] {
      margin: auto;
    }
  }
`;

export default ColorMapControls;
