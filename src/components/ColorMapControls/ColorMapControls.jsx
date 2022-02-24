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

import Section from "../Section";

function ColorMapControls({ colorMaps, model, setModel }) {
  return (
    <Section title="Color Map">
      {Object.keys(colorMaps).length > 1 ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={model.colorMap.name}
          onChange={(color) =>
            setModel((model) => ({
              ...model,
              colorMap: color,
            }))
          }
        >
          <ListboxButton>
            <OutlinedImg
              src={colorMaps[model.colorMap]}
              alt="The current color map"
              height="20px"
              width="95%"
            />
            <ListboxArrow />
          </ListboxButton>
          <ListboxPopover>
            <ListboxList>
              {Object.entries(colorMaps).map(([name, path]) => (
                <StyledListboxOption key={name} value={name}>
                  <OptionText>{name}</OptionText>
                  <OptionImg src={path} alt={name} width="0" height="auto" />
                </StyledListboxOption>
              ))}
            </ListboxList>
          </ListboxPopover>
        </StyledListboxInput>
      ) : (
        <OutlinedImg
          src={colorMaps[model.colorMap]}
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
