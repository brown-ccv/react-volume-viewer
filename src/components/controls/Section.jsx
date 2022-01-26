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
  margin-top: 16px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 8px;
`;

export default Section;
