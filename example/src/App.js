import React, { useState } from "react";

import { VolumeViewer } from "react-volume-viewer";
import "./index.css";

import haline from "./assets/colormaps/haline.png";
import thermal from "./assets/colormaps/thermal.png";
// import model from "./assets/models/summer-high-salt.png";

export default function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [useTransferFunction, setUseTransferFunction] = useState(true);

  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main style={{ margin: "25px" }}>
        <div>
          <button
            onClick={() => setColorMap(colorMap === haline ? thermal : haline)}
          >
            Color Map
          </button>
          <button onClick={() => setControlsVisible(!controlsVisible)}>
            Controls Visible
          </button>
          <button onClick={() => setUseTransferFunction(!useTransferFunction)}>
            Use Transfer Function
          </button>
        </div>

        <VolumeViewer
          className="volumeViewer"
          colorMaps={{
            Haline: haline,
            Thermal: thermal,
          }}
          colorMap={colorMap}
          controlsVisible={controlsVisible}
          model={{
            range: { min: 0.05, max: 33.71, unit: "°C" },
            path: "assets/models/summer-high-salt.png",
            scale: "1 -1 1",
            rotation: "-55 0 0",
          }}
          useTransferFunction={useTransferFunction}
        />
        <hr />
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
