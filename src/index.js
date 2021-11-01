import React from "react";
import PropTypes from "prop-types";

import styles from "./styles/styles.module.css";

function ExampleComponent(props) {
  const { text } = props;

  return <div className={styles.test}>Example Component: {text}</div>;
}

ExampleComponent.propTypes = {
  text: PropTypes.string,
};

ExampleComponent.defaultProps = {
  text: "Default Prop",
};

export { ExampleComponent };
