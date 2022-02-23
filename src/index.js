import VolumeViewer from "./components/VolumeViewer";
import { DEFAULT_COLOR_MAPS } from "./constants/constants";

// TODO: This won't be needed when we don't need DEFAULT_COLOR_MAPS internally
const ColorMaps = {
    grayscale: DEFAULT_COLOR_MAPS[0],
    natural: DEFAULT_COLOR_MAPS[1],
    rgb: DEFAULT_COLOR_MAPS[2],
}

// import grayscale from "./images/grayscale.png";
// import natural from "./images/natural.png";
// import rgb from "./images/rgb.png";

// const grayscaleColorMap = { name: "Grayscale", path: grayscale };
// const naturalColorMap = { name: "Natural", path: natural };
// const rgbColorMap = { name: "RGB", path: rgb };

export { 
    VolumeViewer,
    // DEFAULT_COLOR_MAPS as ColorMaps,
    ColorMaps,
};
