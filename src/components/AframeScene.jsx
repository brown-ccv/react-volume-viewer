import React from "react";
import styled from "styled-components";
import { Entity, Scene } from "aframe-react";

import "aframe";
// import "aframe-event-set-component";
// import "aframe-orbit-controls";

import "../Aframe/loader.js";
import "../Aframe/buttons-check.js";
import "../Aframe/cursor-listener";
import "../Aframe/render-2d-clipplane";

const StyledScene = styled(Scene)`
  position: relative;
  height: 90vh;
`;

export default function AframeScene({ state, useTransferFunction, model }) {
  function getCoordinates(transferFunctionNodes, plane) {
    let coordinates = [];
    if (plane === "x" || plane === "y") {
      transferFunctionNodes.forEach((node) => {
        coordinates.push(node[plane]);
      });
    } else console.error("Invalid Plane", plane);
  
    return coordinates;
  }

  return (
    <StyledScene id="volumeViewerScene" background="color: black" embedded>
      <Entity
        id="rhand"
        raycaster="objects: .clickableMesh"
        buttons-check={{ clipPlane: false, grabObject: false }}
        collider-check={{ intersecting: false }}
      />

      <Entity
        id="clipplane2DListener"
        render-2d-clipplane={{
          activateClipPlane: true,
          xBounds: state.sliders.x,
          yBounds: state.sliders.y,
          zBounds: state.sliders.z,
          currentAxisAngle: "0 0 0",
          rotateAngle: "0 0 0",
          clipX: "0 0",
        }}
      />
      <a-plane
        class="clickable"
        id="clipplane2D"
        visible="false"
        height="1"
        width="1"
        material="color: red ; side:double; transparent:true;opacity:0.3"
        cursor-listener
      />

      {/* TODO: Add Entity with the loader */}
      <Entity
        id="volumeCube"
        class="clickableMesh"
        loader={{
          useTransferFunction: useTransferFunction,
          colorMap: state.colorMap,
          alphaXDataArray: getCoordinates(
            state.transferFunction,
            "x"
          ),
          alphaYDataArray: getCoordinates(
            state.transferFunction,
            "y"
          ),
          path: model.path,
          slices: model.slices,
          x_spacing: model.spacing.x,
          y_spacing: model.spacing.y,
          z_spacing: model.spacing.z,
        }}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
      />

      <a-entity cursor="rayOrigin:mouse" raycaster="objects: .clickable" />
      <Entity
        id="camera"
        camera="active: true"
        look-controls
        arcball-camera="initialPosition:0 0 1"
      />
    </StyledScene>
  );
}
