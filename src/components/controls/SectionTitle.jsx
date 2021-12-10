import React from "react";
import styled from "styled-components";

function SectionTitle({ children }) {
  return <Title>{children}</Title>;
}

const Title = styled.h2`
  margin-top: 0;
`;

export default SectionTitle;
