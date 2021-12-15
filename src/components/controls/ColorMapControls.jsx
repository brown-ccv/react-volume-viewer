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

// TODO: colorMaps === null, just display colorMap
function ColorMapControls({ state: { colorMap }, setState, colorMaps }) {
  return (
    <Wrapper>
      <Title>Color Map</Title>

      {colorMaps && Object.keys(colorMaps).length > 1 ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={colorMap.name}
          onChange={(color) =>
            setState((state) => ({ ...state, colorMap: colorMaps[color] }))
          }
        >
          <ListboxButton>
            <OutlinedImage
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
      ) : (
        <OutlinedImage
          src={colorMap}
          alt="The current color map"
          height="20px"
          width="100%"
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 25px 0;
  margin-top: 0;
`;

const OutlinedImage = styled.img`
  outline: solid 1px;
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
