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
            <OutlinedImg
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
                <StyledListboxOption key={color.name} value={color.name}>
                  <OptionText>{color.name}</OptionText>
                  <OptionImg
                    src={color.path}
                    alt={color.name}
                    width="0"
                    height="auto"
                  />
                </StyledListboxOption>
              ))}
            </ListboxList>
          </ListboxPopover>
        </StyledListboxInput>
      ) : (
        <OutlinedImg
          src={colorMap.path}
          alt="The current color map"
          height="20px"
          width="100%"
        />
      )}
    </Section>
  );
}

const OutlinedImg = styled.img`
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

const StyledListboxOption = styled(ListboxOption)`
  display: flex;
  gap: 8px;
`;
const OptionText = styled.div`
  flex: 1;
  align-self: center;
`;
const OptionImg = styled(OutlinedImg)`
  flex: 3;
`;

export default ColorMapControls;
