import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

function EnabledControls({ enabled, modelIdx, setModels }) {
  return (
    <IconCheckbox
      onClick={(e) => {
        e.stopPropagation();
        setModels((models) => [
          ...models.slice(0, modelIdx),
          {
            ...models[modelIdx],
            enabled: !enabled,
          },
          ...models.slice(modelIdx + 1),
        ]);
      }}
    >
      {enabled ? (
        <FontAwesomeIcon icon={faEye} />
      ) : (
        <FontAwesomeIcon icon={faEyeSlash} />
      )}
    </IconCheckbox>
  );
}

const IconCheckbox = styled.span``;

export default EnabledControls;
