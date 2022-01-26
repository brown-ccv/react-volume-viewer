import React from "react";
import styled from "styled-components";

function SectionTitle({ children }) {
  return <Title>{children}</Title>;
}

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 8px;
`;

export default SectionTitle;
