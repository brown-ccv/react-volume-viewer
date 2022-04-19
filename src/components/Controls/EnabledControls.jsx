import React from "react";
import visible from "../../images/visible.svg";
import visibleOff from "../../images/visible_off.svg";
import styled from "styled-components";

function EnabledControls({ enabled, modelIdx, setModel }) {
  return (
    <VisibleImg
      src={enabled ? visible : visibleOff}
      alt={enabled ? "visible" : "not visible"}
      onClick={(e) => {
        e.stopPropagation();
        setModel({ enabled: !enabled }, modelIdx);
      }}
    />
  );
}

const VisibleImg = styled.img`
  width: 1.125rem;
  height: 1.125rem;
`;

export default EnabledControls;
