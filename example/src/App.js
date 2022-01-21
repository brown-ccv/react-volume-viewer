import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer } from "react-volume-viewer";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css"

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const haline = { name: "Haline", path: "./assets/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "./assets/colormaps/thermal.png" };
const initColorMaps = [haline, thermal];
let channels = ["Red", "Green", "Blue"];
let currentTitle = "";

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [useDefaultColorMaps, setUseDefaultColorMaps] = useState(true);
  const [colorMaps, setColorMaps] = useState(initColorMaps);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [modelPath, setModelPath] = useState(salt);
  const [currentChannel, setCurrentChannel] = useState(1);
  const [currentTittle, setCurrentTittle] = useState("Red");

  const handleSelect = (e) => {
    console.log(e);
    setCurrentChannel(e);
    console.log("handleSelect currentChannel: " + currentChannel);
  };

  const changeValue = (e) => {
    console.log("changeValue");
    console.log(e);
    
  };

  const Buttons = (
    <>
      {" "}
      <button onClick={() => setControlsVisible(!controlsVisible)}>
        Controls Visible
      </button>
     
      <button
        onClick={() => setColorMap(colorMap === haline ? thermal : haline)}
      >
        Color Map
      </button>
     
    </>
  );

  const VV = (
    <StyledVolumeViewer
      colorMap={colorMap}
      colorMaps={colorMaps}
      controlsVisible={controlsVisible}
      model={{
        range: {
          min: 0.05,
          max: 33.71,
          unit: "°C",
        },
        path: "/assets/models/spheroids-result-gamma-2-3.png",
        scale: "1 1 1",
        rotation: "0 0 0",
        slices: 65,
        spacing: { x: 1.0, y: 1.0, z: 1.0 },
      }}
      useTransferFunction={useTransferFunction}
      useDefaultColorMaps={useDefaultColorMaps}
      useTransferFunction={false}
      channel={currentChannel}
      intensity={18.0}
    />
  );

  return (
    <>
      <header>
        <h1>Microscopy Viewer</h1>
      </header>

      <Main>
        {Buttons}
        <DropdownButton
          id="dropdown-basic-button"
          title={channels[currentChannel - 1]}
          onSelect={handleSelect}
        >
          <Dropdown.Item onClick={changeValue} eventKey="1">
            Red
          </Dropdown.Item>
          <Dropdown.Item onClick={changeValue} eventKey="2">
            Green
          </Dropdown.Item>
          <Dropdown.Item onClick={changeValue} eventKey="3">
            Blue
          </Dropdown.Item>
        </DropdownButton>
        {VV}
        <hr />
      </Main>

      <footer>
        
      </footer>
    </>
  );
}

const StyledVolumeViewer = styled(VolumeViewer)`
  height: 75vh;
`;

const Main = styled.main`
  padding: 25px;
`;

export default App;
