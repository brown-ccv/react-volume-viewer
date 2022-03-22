import React from "react";
import styled from "styled-components";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import ColorMapControls from "./ColorMapControls.jsx";
import TransferFunctionControls from "./TransferFunctionControls.jsx";
import ClipControls from "./ClipControls.jsx";
import EnabledControls from "./EnabledControls.jsx";

function Controls({
  controlsVisible,
  models,
  sliders,
  setModels,
  setSliders,
  reset,
}) {
  return (
    <Wrapper $visible={controlsVisible}>
      <StyledTabList>
        {models.map((model, idx) => (
          <FlexTab key={model.name}>
            {model.name}
            <EnabledControls
              enabled={model.enabled}
              modelIdx={idx}
              setModels={setModels}
            />
          </FlexTab>
        ))}
      </StyledTabList>

      <StyledTabPanels>
        {models.map((model, idx) => (
          <TabPanel key={model.name}>
            <ColorMapControls
              model={model}
              modelIdx={idx}
              setModels={setModels}
            />

            {model.useTransferFunction && (
              <TransferFunctionControls
                initTransferFunction={model.initTransferFunction}
                modelIdx={idx}
                range={model.range}
                setModels={setModels}
              />
            )}
            <Button onClick={reset}> Reset </Button>
          </TabPanel>
        ))}
        <ClipControls sliders={sliders} setSliders={setSliders} />
      </StyledTabPanels>
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
  overflow: auto;
  display: ${(props) => (props.$visible ? "initial" : "none")};
`;

// TODO: Cleaner way than just the scrollbar
const StyledTabList = styled(TabList)`
  overflow: auto;
`;

const FlexTab = styled(Tab)`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledTabPanels = styled(TabPanels)`
  padding: 0px 16px; // Section.jsx handles spacing on y axis
`;

const Button = styled.button``;

export default Controls;
