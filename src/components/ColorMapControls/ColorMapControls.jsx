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

function ColorMapControls({ colorMaps, model, modelIdx, setModels }) {
  return (
    <Section title="Color Map">
      {colorMaps.length > 1 ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={model.colorMap.name}
          onChange={(newColorMapName) =>
            setModels((models) => [
              ...models.slice(0, modelIdx),
              {
                ...models[modelIdx],
                colorMap: colorMaps.find(
                  (colorMap) => newColorMapName === colorMap.name
                ),
              },
              ...models.slice(modelIdx + 1),
            ])
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
            <ListboxList>
              {colorMaps.map(({ name, path }) => (
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
