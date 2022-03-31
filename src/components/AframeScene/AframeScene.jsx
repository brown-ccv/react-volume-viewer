import React, { memo, useState, useEffect } from "react";
import styled from "styled-components";
import { isEqual } from "lodash";

import "../../Aframe/arcball-camera";
import "../../Aframe/buttons-check";
import "../../Aframe/collider-check";
import "../../Aframe/entity-collider-check";
import "../../Aframe/keypress-listener";
import "../../Aframe/volume";

import { getAframeModels } from "../../utils";

function AframeScene({ models, position, rotation, scale, sliders }) {
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      setErrors(e.detail);
    };

    document.addEventListener("aframe-error", handler);
    return () => document.removeEventListener("aframe-error", handler);
  }, []);

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
        <a-box
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

      {/* TODO: Replace with better error message */}
      {errors.length && (
        <Wrapper>
          {errors.map((e) => (
            <p key={e}>
              {e.message}: &nbsp; {e.cause.message}
            </p>
          ))}
        </Wrapper>
      )}
    </a-scene>
  );
}

const Wrapper = styled.div`
  background-color: white;
  position: relative;
  width: 90%;
  height: 90%;
  top: 5%; // (100% - height) / 2
  margin: auto;
  overflow: auto;
`;

export default memo(AframeScene, isEqual);
