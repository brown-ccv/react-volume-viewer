import React, { useState } from "react";

import { VolumeViewer } from "react-volume-viewer";
import "./index.css";

const haline = "./assets/colormaps/haline.png";
const thermal = "./assets/colormaps/thermal.png";
const salt = "./assets/models/summer-high-salt.png";
const temp = "./assets/models/summer-high-temp.png";

export default function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [useTransferFunction, setUseTransferFunction] = useState(true);
  const [modelPath, setModelPath] = useState(salt);

  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main style={{ margin: "25px" }}>
        <div>
          <button onClick={() => setControlsVisible(!controlsVisible)}>
            Controls Visible
          </button>
          <button onClick={() => setUseTransferFunction(!useTransferFunction)}>
            Use Transfer Function
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

        <VolumeViewer
          className="volumeViewer"
          // colorMaps={{
          //   Haline: haline,
          //   Thermal: thermal,
          // }}
          // colorMap={colorMap}
          controlsVisible={controlsVisible}
          model={{
            range: {
              min: 0.05,
              max: 33.71,
              unit: "°C",
            },
            path: modelPath,
            scale: "1 -1 1",
            rotation: "-55 0 0",
          }}
          useTransferFunction={useTransferFunction}
          useDefaultColorMaps={false}
        />
        <hr />
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
