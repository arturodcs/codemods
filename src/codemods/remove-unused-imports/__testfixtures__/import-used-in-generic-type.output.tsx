// @ts-nocheck
import { Component } from "react";

interface Props {
  message: string;
}

class MyComponent extends Component<Props> {
  render() {
    return <div>{this.props.message}</div>;
  }
}

export default MyComponent;
