import React, { useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import { useVolumeViewerContext } from "../context/context";
import AframeScene from "./AframeScene.jsx";

export default function App(props) {
  const {
    controlsVisible = true, // Whether or not the controls can be seen
    useTransferFunction = true, // Whether or not to color the model with the transfer function
    initTransferFunction, // The initial transfer function (pass to change default in context)
    useDefaultColorMaps = true, // Whether or not to use the package's default color maps
    colorMaps = [], // Additional color maps
    colorMap, // The current color map (pass to change without using controls)

    // Model Information
    path, // Path to the model (REQUIRED)
    slices = 55, // Number of slices in the png
    spacing = { x: 2, y: 2, z: 1 }, // Spacing of the slices, consolidated into 1 object
    position = "0 0 0", // Position of the model
    rotation = "0 0 0", // Rotation of the model, default isn't the rotation of the RIDDC models
    scale = "1 1 1", // Scale of the models, default isn't the scale of the RIDDC models
    dataRange = { min: 0, max: 1, unit: "" }, // Data points used in OpacityControls.js from unmerged branch
  } = props;

  console.log(props);

  const { state, dispatch } = useVolumeViewerContext();

  // Change Model when prop changes
  useEffect(() => {
    dispatch({
      type: "CHANGE_MODEL",
      model: {
        path: path,
        slices: slices,
        spacing: spacing,
        position: position,
        rotation: rotation,
        scale: scale,
        dataRange: dataRange,
      },
    });
  }, []);

  return (
    <Container fluid className="p-4">
      <Row className="justify-content-center">
        {/* {controlsVisible && <Controls />} */}

        <Col className="align-self-center text-center">
          <div id="modelLoaded">
            <Spinner
              animation="border"
              role="status"
              style={{ display: "block" }}
            >
              <span className="visually-hidden">Loading Volume</span>
            </Spinner>
          </div>
          <AframeScene />
        </Col>
      </Row>
    </Container>
  );
}
