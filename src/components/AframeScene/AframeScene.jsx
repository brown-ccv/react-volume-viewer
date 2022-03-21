import React from "react";

import "aframe";
import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/model";
import "../../Aframe/render-2d-clipplane";
import "../../Aframe/entity-collider-check";
import "../../Aframe/collider-check";

import { toAframeString } from "../../utils";

function AframeScene({ models, sliders }) {
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
