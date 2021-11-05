import React from "react";

import { VolumeViewer } from "react-volume-viewer";

export default function App() {
  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main>
        <VolumeViewer path=""/>
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
