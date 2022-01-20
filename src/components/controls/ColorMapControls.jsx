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

function ColorMapControls({ colorMaps, colorMap, setColorMap }) {
  return (
    <Wrapper>
      <Title>Color Map</Title>

      {colorMaps.length > 1 ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={colorMap.name}
          onChange={(color) =>
            setColorMap(colorMaps.find((colorMap) => colorMap.name === color))
          }
        >
          <ListboxButton>
            <OutlinedImage
              src={colorMap.path}
              alt="The current color map"
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
                    src={color.path}
                    alt={color.name}
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
          src={colorMap.path}
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
