import React from "react";

import { ExampleComponent } from "react-volume-viewer";
import "react-volume-viewer/dist/index.css";

export default function App() {
  return (
    <>
      <header>
        <h1>Hello, World</h1>
      </header>

      <main>
        <ExampleComponent text="Create React Library Example 😄" />
        <ExampleComponent />
      </main>

      <footer>
        <h1>Goodbye, World!</h1>
      </footer>
    </>
  );
}
