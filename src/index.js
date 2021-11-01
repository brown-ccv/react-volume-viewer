import React from "react";
import PropTypes from "prop-types";

import styles from "./styles.module.css";

function ExampleComponent(props) {
  const { text } = props;

  return <div className={styles.test}>Example Component: {text}</div>;
}

ExampleComponent.propTypes = {
  text: PropTypes.string,
};

// Same approach for defaultProps too
ExampleComponent.defaultProps = {
  text: "Default Prop",
};

export default ExampleComponent;
