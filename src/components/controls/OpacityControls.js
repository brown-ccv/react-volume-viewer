import React, { Component } from "react";
import styled from "styled-components";
import { scaleLinear } from "d3-scale";

import Title from "./SectionTitle.jsx";

const Button = styled.button`
`;


const Labels = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  > p {
    font-weight: bold;
    margin: 0;
    font-size: 11px;
  }
`


// TODO: Reset button should reset to original colorMap as well
export default class OpacityControls extends Component {
  constructor(props) {
    super(props);

    this.dataSpace = {
      min: 0,
      mid: 0,
      max: 1,
      units: "",
    };
  }

  render() {
    return (
      <div>
        <Title>Transfer Function</Title>
        <canvas ref="canvas" id="opacityControls" />
        <Labels>
          <p>
            {this.dataSpace.min.toFixed(this.displayedDecimals)}{" "}
            {this.dataSpace.units}
          </p>
          <p>
            {this.dataSpace.mid.toFixed(this.displayedDecimals)}{" "}
            {this.dataSpace.units}
          </p>
          <p>
            {this.dataSpace.max.toFixed(this.displayedDecimals)}{" "}
            {this.dataSpace.units}
          </p>
        </Labels>
        
        <p>
          Double-click to add a point to the transfer function. Right-click to
          remove a point. Drag points to change the function.
        </p>
        {/* <Button onClick={this.resetOpacityPoints}> Reset </Button> */}
        <Button> Reset </Button>
      </div>
    );
  }
}
