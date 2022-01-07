import React from "react";
import "aframe";

import "../Aframe/arcball-camera";
import "../Aframe/buttons-check";
import "../Aframe/model";

// aframe data is passed as a string
const toAframeString = (obj) => {
  let str = "";
  Object.entries(obj).forEach(([key, val]) => {
    let propStr = `${key}: ${val};`;

    // Image imports begin with data:image/png;64
    // Remove ; to parse into aframe correctly
    // The ; is re-injected in loader.js
    if (key === "colorMap") propStr = propStr.replace(";", "") + ";";

    str += propStr;
  });
  return str;
}

function AframeScene(props) {
  const {
    state: { colorMap, model, sliders, transferFunction },
    useTransferFunction,
  } = props;

  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* ARCBALL CAMERA */}
      <a-entity
        id="camera"
        camera="active: true"
        look-controls
        arcball-camera="initialPosition: 0 0 1"
      />

      {/* MOUSE */}
      <a-entity cursor="rayOrigin:mouse" raycaster="objects: .clickable" />

      {/* BUTTONS CHECK */}
      <a-entity id="rhand" raycaster="objects: .clickableMesh" buttons-check />

      <a-plane
        class="clickable"
        // visible="false"
        height="1"
        width="1"
        material="color: red; side: double; transparent: true; opacity: 0.2"
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
      />

      {/* MODEL*/}
      <a-entity
        id="volumeCube"
        class="clickableMesh"
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        model={toAframeString({
          transferFunctionX: transferFunction.map((p) => p["x"]),
          transferFunctionY: transferFunction.map((p) => p["y"]),
          colorMap: colorMap,
          path: model.path,
          slices: model.slices,
          spacing: [model.spacing.x, model.spacing.y, model.spacing.z],
          useTransferFunction: useTransferFunction,
          xBounds: sliders.x,
          yBounds: sliders.y,
          zBounds: sliders.z,
        })}
      />
    </a-scene>
  );
}

export default AframeScene;
