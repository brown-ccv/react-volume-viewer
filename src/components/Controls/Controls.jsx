import React from "react";
import styled from "styled-components";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import ColorMapControls from "../ColorMapControls";
import OpacityControls from "../OpacityControls";
import ClipControls from "../ClipControls";

function Controls({
  colorMaps,
  models,
  sliders,
  setModels,
  setSliders,
  reset,
}) {
  // Keep track of currently open model
  const [tabIndex, setTabIndex] = React.useState(0);
  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  // TODO: Each individual Tab/TabPanel should only updated when the specific model changes
  return (
    <Wrapper index={tabIndex} onChange={handleTabsChange}>
      <StyledTabList>
        {models.map((model) => (
          <Tab key={model.name}>{model.name}</Tab>
        ))}
      </StyledTabList>

      <StyledTabPanels>
        {models.map((model) => (
          <TabPanel key={model.name}>
            <ColorMapControls
              colorMaps={colorMaps}
              model={model}
              modelIdx={tabIndex}
              setModels={setModels}
            />

            {model.useTransferFunction && (
              <OpacityControls
                initTransferFunction={model.initTransferFunction}
                modelIdx={tabIndex}
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
`;

// TODO: Cleaner way than just the scrollbar
const StyledTabList = styled(TabList)`
  overflow: auto;
`;

const StyledTabPanels = styled(TabPanels)`
  padding: 0px 16px; // Section.jsx handles spacing on y axis
`;

const Button = styled.button``;

export default Controls;
