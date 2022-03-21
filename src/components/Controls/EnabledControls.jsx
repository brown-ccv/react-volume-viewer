import React from "react";
import styled from "styled-components";

import Section from "./Section.jsx";

function EnabledControls({ enabled, modelIdx, setModels }) {
  console.log(enabled, modelIdx);
  return (
    <Section>
      <p>Enabled: {enabled.toString()}</p>
      <input
        type="checkbox"
        role="switch"
        checked={enabled}
        onChange={(event) =>
          setModels((models) => {
            console.log(models, models[modelIdx]);
            return [
              ...models.slice(0, modelIdx),
              {
                ...models[modelIdx],
                enabled: event.target.checked,
              },
              ...models.slice(modelIdx + 1),
            ];
          })
        }
      />
    </Section>
  );
}

export default EnabledControls;
