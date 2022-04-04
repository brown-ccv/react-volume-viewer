import React from "react";
import styled from "styled-components";

function Section({ className, children }) {
  return <Wrapper className={className}>{children}</Wrapper>;
}

const Wrapper = styled.div`
  margin: 16px 0px;
`;
export default Section;
