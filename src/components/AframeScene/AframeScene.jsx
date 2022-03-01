import React from "react";

import "aframe";

import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/model";
import "../../Aframe/render-2d-clipplane";
import "../../Aframe/entity-collider-check";
import "../../Aframe/collider-check";

// aframe data is passed as a string
const toAframeString = (obj) => {
  let str = "";
  Object.entries(obj).forEach(([key, val]) => {
    let propStr = `${key}: ${val};`;

    // Image imports begin with data:image/png;64
    // Remove ; to parse into aframe correctly
    // The ; is re-injected in loader.js
    if (key === "colorMapSrc") propStr = propStr.replace(";", "") + ";";

    str += propStr;
  });
  return str;
};

function AframeScene({ colorMaps, model, sliders }) {
  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* HAND */}
      <a-entity
        id="rhand"
        raycaster="objects: .clickableMesh"
        buttons-check={toAframeString({
          clipPlane: false,
          grabObject: false,
        })}
        collider-check={toAframeString({
          intersecting: false,
        })}
      />

      <a-entity
        id="clipplane2DListener"
        render-2d-clipplane={toAframeString({
          activateClipPlane: true,
          xBounds: sliders.x,
          yBounds: sliders.y,
          zBounds: sliders.z,
        })}
      />

      {/* CLICKABLE PLANE FOR MOUSE INTERACTIONS */}
      <a-plane
        class="clickable"
        id="clipplane2D"
        visible="false"
        height="1"
        width="1"
        material="color: red; side: double; transparent: true; opacity: 0.2"
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
      />

      {/* MODEL */}
      <a-entity
        id="volumeCube"
        class="clickableMesh"
        model={toAframeString({
          channel: model.channel,
          colorMapSrc: colorMaps[model.colorMap],
          intensity: model.intensity,
          path: model.path,
          slices: model.slices,
          sliders: JSON.stringify(sliders),
          spacing: JSON.stringify(model.spacing),
          transferFunction: JSON.stringify(model.transferFunction),
          useTransferFunction: model.useTransferFunction,
        })}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
      />

      {/* MOUSE */}
      <a-entity cursor="rayOrigin:mouse" raycaster="objects: .clickable" />

      {/* CAMERA */}
      <a-entity
        id="camera"
        camera="active: true"
        look-controls
        arcball-camera="initialPosition: 0 0 1;"
      />
    </a-scene>
  );
}

export default AframeScene;
