import React, { useState } from "react";
import styled from "styled-components";
import {
  VolumeViewer,
  ColorMap,
  Point,
  DEFAULT_COLOR_MAPS,
} from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const haline = new ColorMap("Haline", "./assets/colormaps/haline.png");
const thermal = new ColorMap("Thermal", "./assets/colormaps/thermal.png");
const allColorMaps = [haline, thermal, ...DEFAULT_COLOR_MAPS];

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [singleColorMap, setSingleColorMap] = useState(false);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [useColorMap, setUseColorMap] = useState(true);

  // TEMP: Force error
  const [modelPath, setModelPath] = useState(salt);
  // const [modelPath, setModelPath] = useState("model/path");
  // thermal.path = "thermal/path";

  const models = [
    {
      name: "Same",
      colorMap: colorMap,
      ...(!singleColorMap && { colorMaps: allColorMaps }),
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
      },
      path: modelPath,
      transferFunction: [new Point(0, 0), new Point(0.5, 0.5), new Point(1, 1)],
      useTransferFunction: useTransferFunction,
      useColorMap: useColorMap,
    },
    {
      name: "Opposite",
      colorMap: colorMap === haline ? thermal : haline,
      ...(!singleColorMap && { colorMaps: [haline, thermal] }),
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
        unit: "°C",
      },
      path: modelPath === salt ? temp : salt,
      useTransferFunction: !useTransferFunction,
      useColorMap: !useColorMap,
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
