import React from "react";
import styled from "styled-components";
import { Container, Button } from "react-bootstrap";
import { Entity, Scene } from "aframe-react";

import "aframe";
import "aframe-event-set-component";
import "aframe-orbit-controls";

import "../Aframe/loader.js";
import "../Aframe/buttons-check.js";
import "../Aframe/cursor-listener";
import "../Aframe/render-2d-clipplane";

import { useVolumeViewerContext } from "../context/context";

// const SceneContainer = styled(Container)`
//   height: 90vh !important;
// `;

const StyledScene = styled(Scene)`
  height: 90vh;
`;

export default function AframeScene(props) {
  const { state } = useVolumeViewerContext();

  return (
    // <SceneContainer fluid id="visualizer">
    //   <Button>Aframe Scene Button</Button>
    // </SceneContainer>
    <StyledScene id="volumeViewerScene" background="color: black" embedded>
      <Entity
        id="rhand"
        laser-controls="hand: right"
        raycaster="objects: .clickableMesh"
        buttons-check={{ clipPlane: false, grabObject: false }}
        collider-check={{ intersecting: false }}
      />

      <Entity
        id="clipplane2DListener"
        render-2d-clipplane={{
          activateClipPlane: true,
          xBounds: state.xSliderBounds,
          yBounds: state.ySliderBounds,
          zBounds: state.zSliderBounds,
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
