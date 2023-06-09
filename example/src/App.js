import React, { useState } from "react";
import styled from "styled-components";
import { VolumeViewer, COLOR_MAPS, Blending } from "react-volume-viewer";

const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";

const allColorMaps = [...Object.values(COLOR_MAPS)];

function App() {
  const [controlsVisible, setControlsVisible] = useState(false);

  const [singleColorMap, setSingleColorMap] = useState(false);
  const [enabled, setEnabled] = React.useState(true);
  const [blending, setBlending] = useState(Blending.Max);

  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [useColorMap, setUseColorMap] = useState(true);

  return (
    <>
      <Main>
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
          <button onClick={() => setBlending(Blending.Min)}>
            Min Blending
          </button>
          <button onClick={() => setBlending(Blending.Max)}>
            Max Blending
          </button>
          <button onClick={() => setBlending(Blending.Average)}>
            Average Blending
          </button>
        </div>
        <StyledVolumeViewer
          controlsVisible={controlsVisible}
          blending={blending}
          models={[
            {
              name: "Salt",
              colorMap: COLOR_MAPS.Haline,
              ...(!singleColorMap && {
                colorMaps: [
                  COLOR_MAPS.Haline,
                  COLOR_MAPS.Thermal,
                  COLOR_MAPS.Grayscale,
                ],
              }),
              description: "Model visualizing salinity data",
              enabled: enabled,
              path: salt,
              range: {
                min: 0.05,
                max: 33.71,
              },
              transferFunction: [
                { x: 0, y: 0 },
                { x: 0.5, y: 0.75 },
                { x: 1, y: 1 },
              ],
              useTransferFunction: useTransferFunction,
              useColorMap: useColorMap,
            },
            {
              name: "Temperature",
              colorMap: COLOR_MAPS.Thermal,
              ...(!singleColorMap && { colorMaps: allColorMaps }),
              description: "Model visualizing temperature data",
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
          ]}
          position="0 0 0"
          rotation="-55 0 0"
          scale="1 -1 1"
          slices={55}
          spacing="2 2 1"
        />
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
