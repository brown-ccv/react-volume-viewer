import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer } from "react-volume-viewer";

const haline = "./assets/colormaps/haline.png";
const thermal = "./assets/colormaps/thermal.png";
const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const initColorMaps = {
  Haline: haline,
  Thermal: thermal,
};

let channels = ["Green","Red"];
let currentChannel = 0;

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [useDefaultColorMaps, setUseDefaultColorMaps] = useState(true);
  const [colorMaps, setColorMaps] = useState(initColorMaps);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [modelPath, setModelPath] = useState(salt);

  const Buttons = (
    <>
      {" "}
      
      <button
        onClick={() => {setColorMap(colorMap === haline ? thermal : haline)
          currentChannel = (currentChannel +1 ) % 2}}
      >
        Change Channel {channels[currentChannel]}
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
        scale: "1 -1 1",
        rotation: "0 0 0",
        slices: 65,
        spacing: { x: 1.0, y: 1.0, z: 1.0 },
        
      }}
      useTransferFunction={useTransferFunction}
      useDefaultColorMaps={useDefaultColorMaps}
      useTransferFunction={false}
    />
  );

  return (
    <>
      <header>
        <h1>Microscopy Viewer</h1>
      </header>

      <Main>
        {Buttons}
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
