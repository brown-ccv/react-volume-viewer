import React from "react";

import { VolumeViewer } from "react-volume-viewer";

import haline from "./assets/colormaps/haline.png";
import thermal from "./assets/colormaps/thermal.png";
import model from "./assets/models/summer-high-salt.png"

export default function App() {
  // TODO: Add state and buttons to change VolumeViewer props
  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main>
        <VolumeViewer
          path={model}
          colorMaps={{
            Haline: haline,
            Thermal: thermal,
          }}
          colorMap={haline}
          dataRange={{
            min: 0.05,
            max: 33.71,
            units: "°C"
          }}
        />
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
