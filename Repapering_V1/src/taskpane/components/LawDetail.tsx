import * as React from "react";
import { AppProps, AppState } from "./App";
import { Link } from "react-router-dom";

export default class LawDetail extends React.Component<AppProps, AppState> {
  click() {}

  render() {
    return (
      <div>
        <h1>hello</h1>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }
}
