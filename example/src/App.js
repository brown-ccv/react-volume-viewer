import React, { useState } from "react";

import { VolumeViewer } from "react-volume-viewer";
import "./index.css";

import haline from "./assets/colormaps/haline.png";
import thermal from "./assets/colormaps/thermal.png";
import model from "./assets/models/summer-high-salt.png";

export default function App() {
  const [colorMap, setColorMap] = useState(haline);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [useTransferFunction, setUseTransferFunction] = useState(true);

  return (
    <>
      <header>
        <h1>Hello, World</h1>
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
      </header>

      <main style={{ margin: "25px" }}>
        <VolumeViewer
          className="volumeViewer"
          colorMaps={{
            Haline: haline,
            Thermal: thermal,
          }}
          colorMap={colorMap}
          controlsVisible={controlsVisible}
          modelRange={{
            min: 0.05,
            max: 33.71,
            unit: "°C",
          }}
          modelPath={model}
          modelScale="1 -1 1"
          modelRotation="-55 0 0"
          useTransferFunction={useTransferFunction}
        />
        <hr />
        {/* <VolumeViewer
          style={{ height: "50vh", width: "1000px" }}
          modelPath={model}
          modelRange={{
            min: 0.05,
            max: 33.71,
            units: "°C",
          }}
        /> */}
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
