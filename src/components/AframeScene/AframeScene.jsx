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
    if (key === "colorMap") {
      /* 
        colorMap.path is either a png encoded string or the path to a png

        png encoded strings begin with data:image/png;64
        Remove ; to parse into aframe correctly
        Note that the ; is re-injected in model.js
        TODO: Do colorMaps need to be a png?
      */
      val = val.replace("data:image/png;", "data:image/png");
    }

    str += `${key}: ${val};`;
  });
  return str;
};

function AframeScene({ models, sliders }) {
  /* 
    TODO: The whole scene does not have to re-render
    Only the specific model in models.map changes
  */
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

      <a-entity id="models">
        {models.map(
          (model) =>
            model.enabled && (
              <a-entity
                key={model.name}
                id={model.name}
                position={model.position}
                rotation={model.rotation}
                scale={model.scale}
              >
                <a-entity
                  // id="clipplane2DListener"
                  id={`clipplane2DListener-${model.name}`}
                  render-2d-clipplane={toAframeString({
                    activateClipPlane: true,
                    xBounds: sliders.x,
                    yBounds: sliders.y,
                    zBounds: sliders.z,
                  })}
                />

                {/* CLICKABLE PLANE FOR MOUSE INTERACTIONS */}
                <a-plane
                  id={`clipplane2D-${model.name}`}
                  class="clickable"
                  visible="false"
                  height="1"
                  width="1"
                  material="color: red; side: double; transparent: true; opacity: 0.2"
                />

                {/* MODEL */}
                <a-entity
                  id={`model-${model.name}`}
                  class="clickableMesh"
                  model={toAframeString({
                    channel: model.channel,
                    colorMap: JSON.stringify(model.colorMap),
                    intensity: model.intensity,
                    name: model.name,
                    path: model.path,
                    slices: model.slices,
                    sliders: JSON.stringify(sliders),
                    spacing: JSON.stringify(model.spacing),
                    transferFunction: JSON.stringify(model.transferFunction),
                    useTransferFunction: model.useTransferFunction,
                  })}
                />
              </a-entity>
            )
        )}
      </a-entity>

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
