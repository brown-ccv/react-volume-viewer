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
import Title from "./Title.jsx";

function ColorMapControls({ model, setColorMap }) {
  return (
    <Section>
      <Title>Color Map</Title>
      {model.colorMaps.length > 1 ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={model.colorMap.name}
          onChange={(newColorMapName) =>
            setColorMap(
              model.colorMaps.find(
                (colorMap) => newColorMapName === colorMap.name
              )
            )
          }
        >
          <ListboxButton>
            <OutlinedImg
              src={model.colorMap.path}
              alt="The current color map"
              height="20px"
              width="95%"
            />
            <ListboxArrow />
          </ListboxButton>
          <ListboxPopover>
            <OverflowListboxList>
              {model.colorMaps.map(({ name, path }) => (
                <StyledListboxOption key={name} value={name}>
                  <OptionText>{name}</OptionText>
                  <OptionImg src={path} alt={name} width="0" height="auto" />
                </StyledListboxOption>
              ))}
            </OverflowListboxList>
          </ListboxPopover>
        </StyledListboxInput>
      ) : (
        <OutlinedImg
          src={model.colorMap.path}
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

const OverflowListboxList = styled(ListboxList)`
  max-height: 525px;
  overflow: auto;
`

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
