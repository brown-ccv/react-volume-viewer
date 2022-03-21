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

function ColorMapControls({ model, modelIdx, setModels }) {
  return (
    <Section title="Color Map">
      <Title>Color Map</Title>
      {"colorMaps" in model ? (
        <StyledListboxInput
          aria-labelledby="ColorMap dropdown"
          value={model.colorMap.name}
          onChange={(newColorMapName) =>
            setModels((models) => [
              ...models.slice(0, modelIdx),
              {
                ...models[modelIdx],
                colorMap: model.colorMaps.find(
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
              {model.colorMaps.map(({ name, path }) => (
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
