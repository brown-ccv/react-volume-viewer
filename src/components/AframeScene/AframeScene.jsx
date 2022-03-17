import React from "react";

import "aframe";

import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/collider-check";
import "../../Aframe/entity-collider-check";
import "../../Aframe/keypress-listener";
import "../../Aframe/volume";

import { getAframeModels } from "../../utils";

function AframeScene({ models, position, rotation, scale, sliders }) {
  return (
    <a-scene id="volumeViewerScene" background="color: black" embedded>
      {/* HAND */}
      <a-entity
        id="hand"
        raycaster="objects: .clickableMesh"
        buttons-check={`gripDown: ${false}; triggerDown: ${false};`}
        collider-check={`intersecting: ${false};`}
      />
      <a-entity
        id="volume-container"
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

        {/* VOLUME */}
        <a-entity
          id="volume"
          class="clickableMesh"
          volume={`
            models: ${getAframeModels(models)};
            sliders: ${JSON.stringify(sliders)};
          `}
          // render-2d-clipplane={`activateClipPlane: ${true};`}
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
