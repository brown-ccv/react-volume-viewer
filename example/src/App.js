import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer, COLOR_MAPS, Blending } from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";

const allColorMaps = [...Object.values(COLOR_MAPS)];
const haline = COLOR_MAPS.Haline;
const thermal = COLOR_MAPS.Thermal;

function App() {
  const [controlsVisible, setControlsVisible] = useState(false);

  const [singleColorMap, setSingleColorMap] = useState(false);
  const [enabled, setEnabled] = React.useState(true);
  const [blending, setBlending] = useState(Blending.Max);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [useColorMap, setUseColorMap] = useState(true);

  const models = [
    {
      name: "Salt",
      colorMap: haline,
      ...(!singleColorMap && {
        colorMaps: [haline, thermal, COLOR_MAPS.Grayscale],
      }),
      enabled: enabled,
      path: salt,
      range: {
        min: 0.05,
        max: 33.71,
      },
      transferFunction: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.5 },
        { x: 1, y: 1 },
      ],
      useTransferFunction: useTransferFunction,
      useColorMap: useColorMap,
    },
    {
      name: "Temp",
      colorMap: thermal,
      ...(!singleColorMap && { colorMaps: allColorMaps }),
      enabled: enabled,
      path: temp,
      range: {
        min: 2.5,
        max: 42,
        unit: "°C",
      },
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
      <button onClick={() => setSingleColorMap(!singleColorMap)}>
        Single Color Map
      </button>
      <button onClick={() => setEnabled(!enabled)}>Enabled</button>
      <button onClick={() => setBlending(Blending.Max)}>Blending Max</button>
      <button onClick={() => setBlending(Blending.Min)}>Blending Min</button>
      <button onClick={() => setBlending(Blending.Average)}>
        Blending Average
      </button>
    </div>
  );

  const VV = (
    <StyledVolumeViewer
      controlsVisible={controlsVisible}
      blending={blending}
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
