import React, { useState } from "react";

import config from "./assets/config.json";
import haline from "./assets/colormaps/haline.png";
import thermal from "./assets/colormaps/thermal.png";

import ModelSelector from "./components/ModelSelector";
import VolumeViewerWrapper from "./components/VolumeViewerWrapper";
import "./styles/main.scss"

const ALL_COLOR_MAPS = {
  Haline: haline,
  Thermal: thermal,
};
const BUTTONS = {
  season: config.season,
  tide: config.tide,
  measurement: config.measurement,
};

export default function App() {
  const [controlsVisible, setControlsVisible] = useState(false);

  const [selection, setSelection] = useState({
    season: BUTTONS.season[0],
    tide: BUTTONS.tide[0],
    measurement: BUTTONS.measurement[0],
  });
  const [colorMap, setColorMap] = useState(ALL_COLOR_MAPS.Haline);

  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main style={{ margin: "25px" }}>
        <ModelSelector
          BUTTONS={BUTTONS}
          ALL_COLOR_MAPS={ALL_COLOR_MAPS}
          selection={selection}
          setSelection={setSelection}
          setColorMap={setColorMap}
          toggleControls={() => setControlsVisible(!controlsVisible)}
        />
        <VolumeViewerWrapper
          ALL_COLOR_MAPS={ALL_COLOR_MAPS}
          colorMap={colorMap}
          selection={selection}
          controlsVisible={controlsVisible}
        />
      </main>
      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
