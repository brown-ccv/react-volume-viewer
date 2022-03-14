import React from "react";
import { pick } from "lodash";

import "aframe";
import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/model";
import "../../Aframe/render-2d-clipplane";
import "../../Aframe/entity-collider-check";
import "../../Aframe/collider-check";

import { toAframeString } from "../../utils";

// TEMP
function getModels(models) {
  // TODO: Can we do this in place? forEach instead of map
  const out = models.map((model) => {
    // Pick only needed properties
    model = pick(model, [
      "channel",
      "colorMap",
      "enabled",
      "intensity",
      "name",
      "path",
      "slices",
      "transferFunction",
      "useTransferFunction",
    ]);

    /* colorMap.path is either a png encoded string or the path to a png
      png encoded strings begin with data:image/png;64
      Remove ; to parse into aframe correctly (re-injected in model.js)
      TODO: Do colorMaps need to be a png?
    */
    model.colorMap = {
      name: model.colorMap.name,
      path: model.colorMap.path.replace("data:image/png;", "data:image/png"),
    };

    return model;
  });
  return JSON.stringify(out);
}

function AframeScene({ models, position, rotation, scale, sliders }) {
  // TODO: Only 1 model
  // TODO: Pass models array into aframe
  // TODO: Blend textures into 1 mesh in model.js
  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* HAND */}
      <a-entity
        id="hand"
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
        id="dataset-container"
        position={position}
        rotation={rotation}
        scale={scale}
      >
        {/* CLICKABLE PLANE FOR MOUSE INTERACTIONS */}
        <a-plane
          id="clipplane2D"
          class="clickable"
          visible="false"
          height="1"
          width="1"
          material="color: red; side: double; transparent: true; opacity: 0.2"
        />

        {/* MOUSE LISTENER FOR CLICKABLE PLANE */}
        <a-entity
          id="clipplane2DListener"
          render-2d-clipplane={toAframeString({
            activateClipPlane: true,
            xBounds: sliders.x,
            yBounds: sliders.y,
            zBounds: sliders.z,
          })}
        />

        {/* MODEL */}
        <a-entity
          id="dataset"
          class="clickableMesh"
          model={`models: ${getModels(models)};`}
        />
      </a-entity>

      {/* MOUSE */}
      <a-entity
        id="mouse"
        cursor="rayOrigin:mouse"
        raycaster="objects: .clickable"
      />

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
