import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer, COLOR_MAPS, Blending } from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const haline = { name: "Haline", path: "./assets/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "./assets/colormaps/thermal.png" };

const allColorMaps = [haline, thermal, ...Object.values(COLOR_MAPS)];

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [singleColorMap, setSingleColorMap] = useState(false);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [useColorMap, setUseColorMap] = useState(true);

  const [modelPath, setModelPath] = useState(salt);

  const models = [
    {
      name: "One",
      colorMap: colorMap,
      ...(!singleColorMap && { colorMaps: allColorMaps }),
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
      },
      path: salt,
      transferFunction: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.5 },
        { x: 1, y: 1 },
      ],
      useTransferFunction: useTransferFunction,
      useColorMap: useColorMap,
    },
    {
      name: "Two",
      colorMap: colorMap,
      ...(!singleColorMap && { colorMaps: allColorMaps }),
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
      },
      path: temp,
      transferFunction: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.5 },
        { x: 1, y: 1 },
      ],
      useTransferFunction: useTransferFunction,
      useColorMap: useColorMap,
    },
  ];

  const Buttons = (
    <div>
      <button onClick={() => setControlsVisible(!controlsVisible)}>
        Controls Visible
      </button>
      <button onClick={() => setUseTransferFunction(!useTransferFunction)}>
        Use Transfer Function
      </button>
      <button onClick={() => setUseColorMap(!useColorMap)}>
        Use Color Map
      </button>
      <button onClick={() => setSingleColorMap(singleColorMap ? false : true)}>
        Single Color Map
      </button>
      <button
        onClick={() => setColorMap(colorMap === haline ? thermal : haline)}
      >
        Color Map
      </button>
      <button
        onClick={() => {
          setModelPath(modelPath === salt ? temp : salt);
        }}
      >
        Model
      </button>
      <button
        onClick={() => {
          setColorMap(colorMap === haline ? thermal : haline);
          setModelPath(modelPath === salt ? temp : salt);
        }}
      >
        ColorMap and Model
      </button>
    </div>
  );

  const VV = (
    <StyledVolumeViewer
      controlsVisible={controlsVisible}
      blending={Blending.Max}
      models={models}
      position="0 0 0"
      scale="1 -1 1"
      rotation="-55 0 0"
      slices={55}
      spacing="2 2 1"
    />
  );

  return (
    <>
      <Main>
        {Buttons}
        {VV}
        <hr />
      </Main>
    </>
  );
}

const StyledVolumeViewer = styled(VolumeViewer)`
  height: 85vh;
`;

const Main = styled.main`
  padding: 25px;
`;

export default App;
