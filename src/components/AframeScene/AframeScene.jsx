import React, { memo, useState, useEffect } from "react";
import styled from "styled-components";
import { isEqual } from "lodash";

import "../../aframe/arcball-camera";
import "../../aframe/buttons-check";
import "../../aframe/collider-check";
import "../../aframe/entity-collider-check";
import "../../aframe/keypress-listener";
import "../../aframe/volume";

import { getAframeModels } from "../../utils";

function AframeScene({
  blending,
  models,
  position,
  rotation,
  scale,
  slices,
  spacing,
  sliders,
}) {
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    const handler = (error) => {
      const messages = error.detail.map((e) => {
        console.error(e);
        if (e.cause) return e.message + ". " + e.cause.message;
        else return e.message;
      });
      setErrors(messages);
    };

    document.addEventListener("aframe-error", handler);
    return () => document.removeEventListener("aframe-error", handler);
  }, []);

  return (
    // TODO: Pass the hex value as a prop. Default is #000000
    <a-scene id="volumeViewerScene" background="color: #000000" embedded>
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
        <a-box
          id="volume"
          class="clickableMesh"
          volume={`
              blending: ${JSON.stringify(blending)};
              models: ${getAframeModels(models)};
              slices: ${slices};
              sliders: ${JSON.stringify(sliders)};
              spacing: ${spacing};
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

      {errors.length && (
        <Error>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Error>
      )}
    </a-scene>
  );
}

const Error = styled.div`
  background-color: white;
  position: relative;
  width: 90%;
  height: 90%;
  top: 5%; // (100% - height) / 2
  margin: auto;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default memo(AframeScene, isEqual);
