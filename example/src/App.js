import React from "react";

import { VolumeViewer } from "react-volume-viewer";

import haline from "./assets/colormaps/haline.png";
import thermal from "./assets/colormaps/thermal.png";
import model from "./assets/models/summer-high-salt.png";

export default function App() {
  // TODO: Add state and buttons to change VolumeViewer props
  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main>
        <VolumeViewer
          colorMaps={{
            Haline: haline,
            Thermal: thermal,
          }}
          colorMap={haline}
          controlsVisible={true}
          path={model}
          dataRange={{
            min: 0.05,
            max: 33.71,
            units: "°C",
          }}
          scale="1 -1 1"
          rotation="-55 0 0"
        />
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
