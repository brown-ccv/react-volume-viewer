import React from "react";

import "aframe";
import "../../Aframe/volume";
import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/render-2d-clipplane";
import "../../Aframe/entity-collider-check";
import "../../Aframe/collider-check";

import { getAframeModels } from "../../utils";

function AframeScene({ models, position, rotation, scale, sliders }) {
  // TODO: Only 1 model
  // TODO: Pass models array into aframe
  // TODO: Blend textures into 1 mesh in model.js

  // TODO: position/rotation/scale not loading correctly
  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* HAND */}
      <a-entity
        id="hand"
        raycaster="objects: .clickableMesh"
        buttons-check={`clipPlane: ${false}; grabObject: ${false};`}
        collider-check={`intersecting: ${false};`}
      />
      <a-entity
        id="volume-container"
        position={position}
        rotation={rotation}
        scale={scale}
      >
        {/* CLICKABLE PLANE FOR MOUSE INTERACTIONS */}
        {/* <a-plane
          id="clipplane2D"
          class="clickable"
          visible="false"
          height="1"
          width="1"
          material="color: red; side: double; transparent: true; opacity: 0.2"
        /> */}

        {/* MOUSE LISTENER FOR CLICKABLE PLANE */}
        <a-entity
          id="clipplane2DListener"
          // TODO: Do we need this at all? Just activateClipPlane
          render-2d-clipplane={`
            activateClipPlane: true;
            xBounds: ${sliders.x};
            yBounds: ${sliders.y};
            zBounds: ${sliders.z};
          `}
        />

        {/* VOLUME */}
        <a-entity
          id="volume"
          class="clickableMesh"
          volume={`
            models: ${getAframeModels(models)};
            sliders: ${JSON.stringify(sliders)};
          `}
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
