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

import Section from "./Section.jsx";

function ColorMapControls({ colorMaps, colorMap, setColorMap }) {
  return (
    <Section title="Color Map">
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
    </Section>
  );
}

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
