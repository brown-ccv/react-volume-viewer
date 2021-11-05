import React from "react";
import styled from "styled-components";

const Title = styled.h2`
  margin-top: 0
`

export default function SectionTitle(props) {
    return (
        <Title>{props.children}</Title>
    )
}