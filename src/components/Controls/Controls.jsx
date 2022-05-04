import React, { useCallback } from "react";
import styled from "styled-components";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import ColorMapControls from "./ColorMapControls.jsx";
import TransferFunctionControls from "./TransferFunctionControls.jsx";
import ClipControls from "./ClipControls.jsx";
import EnabledControls from "./EnabledControls.jsx";
import Section from "./Section.jsx";

function Controls({
  controlsVisible,
  models,
  sliders,
  setModels,
  setSliders,
  reset,
}) {
  // Callback function for changing properties of a specific model
  const setModel = useCallback(
    (change, idx) => {
      setModels((models) => [
        ...models.slice(0, idx),
        {
          ...models[idx],
          ...change,
        },
        ...models.slice(idx + 1),
      ]);
    },
    [setModels]
  );

  return (
    <Wrapper $visible={controlsVisible}>
      <StyledTabList>
        {models.map((model, idx) => (
          <FlexTab key={model.name} onClick={(e) => e.preventDefault()}>
            {model.name}
            <EnabledControls
              enabled={model.enabled}
              setEnabled={(enabled) => setModel({ enabled }, idx)}
            />
          </FlexTab>
        ))}
      </StyledTabList>

      <TabPanels>
        {models.map((model, idx) => (
          <TabPanel key={model.name}>
            {model.useColorMap && (
              <ColorMapControls
                model={model}
                setColorMap={(colorMap) => setModel({ colorMap }, idx)}
              />
            )}

            {model.useTransferFunction && (
              <TransferFunctionControls
                transferFunction={model.transferFunction}
                range={model.range}
                setTransferFunction={(transferFunction) =>
                  setModel({ transferFunction }, idx)
                }
              />
            )}

            <Section>
              <Button onClick={reset}> Reset </Button>
            </Section>
          </TabPanel>
        ))}
      </TabPanels>

      <Section>
        <hr />
      </Section>

      <ClipControls sliders={sliders} setSliders={setSliders} />
    </Wrapper>
  );
}

const Wrapper = styled(Tabs)`
  background-color: white;
  position: absolute;
  box-sizing: border-box;
  width: 320px;
  left: 8px;
  top: 8px;
  height: fit-content;
  max-height: calc(100% - 16px); // Leaves 8px to the bottom of the AframeScene
  padding: 0px 16px;
  overflow: auto;
  display: ${(props) => (props.$visible ? "initial" : "none")};
`;

const StyledTabList = styled(TabList)`
  overflow: auto;
  margin: 0px -16px; // Reverts Wrapper padding
`;

const FlexTab = styled(Tab)`
  display: flex;
  align-items: center;
  gap: 5px;

  // Prevent default button click animation
  &:active {
    background-color: initial;
  }
`;

const Button = styled.button``;

export default Controls;
