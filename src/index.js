import React from "react";
import PropTypes from "prop-types";

import { VolumeViewerProvider } from "./context/context";
import App from "./components/App.jsx";

// TODO: HANDLE PROPS & EXCEPTIONS HERE
// TODO: Expect a path, return null if empty
function VolumeViewer(props) {
  const { path } = props;

  return (
    <VolumeViewerProvider>
      <App {...props} />
    </VolumeViewerProvider>
  );
}

VolumeViewer.propTypes = {
  path: PropTypes.string,
};

VolumeViewer.defaultProps = {
  path: null,
};

export { VolumeViewer };
