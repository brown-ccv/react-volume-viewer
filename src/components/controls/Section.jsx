import React from "react";
import styled from "styled-components";

function Section({ title, children }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 16px 0px;
`;

const Title = styled.h2`
  margin: 8px 0px;
`;

export default Section;
