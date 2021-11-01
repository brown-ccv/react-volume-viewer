import React from "react";

const VolumeViewerContext = React.createContext();

// Custom component to provide the context
function VolumeViewerProvider(props) {
  const [state, dispatch] = React.useReducer(volumeViewerReducer, {});

  const value = { state, dispatch };
  return (
    <VolumeViewerContext.Provider value={value}>
      {props.children}
    </VolumeViewerContext.Provider>
  );
}

// Custom Hook to get context
function useVolumeViewerContext() {
  const context = React.useContext(VolumeViewerContext);
  if (context === undefined) {
    throw new Error("useControls must be used within a ControlsProvider");
  }
  return context;
}

// Custom reducer to update the context
function volumeViewerReducer(state, action) {
  switch (action.type) {
    case "TYPE":
      return {};
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// Custom consumer to get the current context
function VolumeViewerConsumer(props) {
  return (
    <VolumeViewerContext.Consumer>
      {(context) => {
        if (context === undefined) {
          throw new Error(
            "ControlsConsumer must be used within a ControlsProvider"
          );
        }
        return props.children(context);
      }}
    </VolumeViewerContext.Consumer>
  );
}

export { useVolumeViewerContext, VolumeViewerProvider, VolumeViewerConsumer };

// TEMP - only while OpacityControls.js is a class based component (can delete)
export { VolumeViewerContext };