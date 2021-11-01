import React from "react";

import styles from "../styles/styles.module.css";
import { useVolumeViewerContext } from "../context/context";

export default function App(props) {
  const { path } = props;

  const { state, dispatch } = useVolumeViewerContext();

  return (
    <div className={styles.test}>
      <p>{path}</p>
    </div>
  );
}
