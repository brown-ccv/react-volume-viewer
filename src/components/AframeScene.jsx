import React from "react";
import styled from "styled-components";
import { Entity, Scene } from "aframe-react";

import "aframe";
import "aframe-event-set-component";
import "aframe-orbit-controls";

import "../Aframe/arcball-camera";
import "../Aframe/buttons-check";
import "../Aframe/cursor-listener";
import "../Aframe/loader";
import "../Aframe/render-2d-clipplane";

function AframeScene({ state, useTransferFunction }) {
  const { model, colorMap, transferFunction, sliders } = state;

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
          xBounds: sliders.x,
          yBounds: sliders.y,
          zBounds: sliders.z,
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

      <Entity
        id="volumeCube"
        class="clickableMesh"
        loader={{
          useTransferFunction: useTransferFunction,
          colorMap: colorMap,
          alphaXDataArray: transferFunction.map((p) => p["x"]),
          alphaYDataArray: transferFunction.map((p) => p["y"]),
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

const StyledScene = styled(Scene)`
  position: relative;
`;

export default AframeScene;
