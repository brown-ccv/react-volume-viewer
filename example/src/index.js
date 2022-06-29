import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));

document.addEventListener('deviceready', () => {
    // ReactDOM.render(<Root />, document.getElementById('root'))
    console.log("DEVICE READY")
  })