import React from "react";
import "aframe";

import "../Aframe/arcball-camera";
import "../Aframe/buttons-check";
import "../Aframe/loader";
import "../Aframe/render-2d-clipplane";

function AframeScene(props) {
  const {
    state: { colorMap, model, sliders, transferFunction },
    useTransferFunction,
  } = props;

  // aframe data is passed as a string
  function toAframeString(obj) {
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
  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* CAMERA */}
      <a-entity
        id="camera"
        camera="active: true"
        look-controls
        arcball-camera
      />

      {/* MOUSE */}
      <a-entity cursor="rayOrigin:mouse" raycaster="objects: .clickable" />

      {/* HAND CONTROLS */}
      <a-entity id="rhand" raycaster="objects: .clickableMesh" buttons-check />

      {/* MODEL */}
      <a-entity
        id="volumeCube"
        class="clickableMesh"
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        loader={toAframeString({
          transferFunctionX: transferFunction.map((p) => p["x"]),
          transferFunctionY: transferFunction.map((p) => p["y"]),
          colorMap: colorMap,
          path: model.path,
          slices: model.slices,
          spacing: [model.spacing.x, model.spacing.y, model.spacing.z],
          useTransferFunction: useTransferFunction,
        })}
      />

      {/* Invisible plane over the model used to click/move it */}
      <a-plane
        class="clickable"
        id="clipplane2D"
        height="1"
        width="1"
        material="color: red ; side:double; transparent:true;opacity:0.3"
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        visible="false"
      />

      {/* Renders the model */}
      <a-entity
        id="clipplane2DListener"
        render-2d-clipplane={toAframeString({
          xBounds: sliders.x,
          yBounds: sliders.y,
          zBounds: sliders.z,
        })}
      />
    </a-scene>
  );
}

export default AframeScene;
