import React from "react";
import styled from "styled-components";

function Title({ children }) {
  return <H2>{children}</H2>;
}

const H2 = styled.h2`
  margin: 8px 0px;
`;

export default Title;
