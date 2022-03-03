import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer, ColorMaps } from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const haline = { name: "Haline", path: "./assets/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "./assets/colormaps/thermal.png" };
const initColorMaps = [
  haline,
  thermal,
  ColorMaps.grayscale,
  ColorMaps.natural,
  ColorMaps.rgb,
];

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [colorMaps, setColorMaps] = useState(initColorMaps);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [modelPath, setModelPath] = useState(salt);

  const models = [
    {
      name: "Same",
      colorMap: colorMap,
      colorMaps: colorMaps,
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
      },
      path: modelPath,
      scale: "1 -1 1",
      rotation: "-55 0 0",
    },
    {
      name: "Opposite",
      colorMap: colorMap === haline ? thermal : haline,
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
        unit: "°C",
      },
      path: modelPath === salt ? temp : salt,
      scale: "1 -1 1",
      rotation: "-55 0 0",
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
      <button
        onClick={() =>
          setColorMaps(colorMaps === initColorMaps ? [colorMap] : initColorMaps)
        }
      >
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
      colorMaps={colorMaps}
      controlsVisible={controlsVisible}
      models={models}
    />
  );

  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <Main>
        {Buttons}
        {VV}
        <hr />
      </Main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}

const StyledVolumeViewer = styled(VolumeViewer)`
  height: 76vh;
`;

const Main = styled.main`
  padding: 25px;
`;

export default App;
