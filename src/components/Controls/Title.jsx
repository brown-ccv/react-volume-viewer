import React from "react";
import styled from "styled-components";

function Title({ className, children }) {
  return <H2 className={className}>{children}</H2>;
}

const H2 = styled.h2`
  margin: 8px 0px;
`;

export default Title;
