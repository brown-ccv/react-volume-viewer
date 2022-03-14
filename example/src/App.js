import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer, ColorMaps } from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";
const haline = { name: "Haline", path: "./assets/colormaps/haline.png" };
const thermal = { name: "Thermal", path: "./assets/colormaps/thermal.png" };
const allColorMaps = [
  haline,
  thermal,
  ColorMaps.grayscale,
  ColorMaps.natural,
  ColorMaps.rgb,
];

function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [singleColorMap, setSingleColorMap] = useState(false);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [modelPath, setModelPath] = useState(salt);

  const models = [
    // {
    //   name: "Same",
    //   colorMap: colorMap,
    //   ...(!singleColorMap && { colorMaps: [haline, thermal] }),
    //   enabled: true,
    //   range: {
    //     min: 0.05,
    //     max: 33.71,
    //   },
    //   path: modelPath,
    //   position: "-0.2 0 0",
    //   scale: "1 -1 1",
    //   rotation: "-55 0 0",
    //   useTransferFunction: useTransferFunction,
    // },
    {
      name: "Opposite",
      // colorMap: colorMap === haline ? thermal : haline,
      colorMap: ColorMaps.rgb,
      ...(!singleColorMap && { colorMaps: allColorMaps }),
      enabled: true,
      range: {
        min: 0.05,
        max: 33.71,
        unit: "°C",
      },
      path: modelPath === salt ? temp : salt,
      position: "0.2 0 0",
      scale: "1 -1 1",
      rotation: "-55 0 0",
      useTransferFunction: useTransferFunction,
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
    <StyledVolumeViewer controlsVisible={controlsVisible} models={models} />
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
