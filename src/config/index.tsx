import * as React from "react";
import ReactDOM from "react-dom";
import Root from "./components/Root";
import store from "./store";

const rootElement = document.getElementById("root");
ReactDOM.render(<Root store={store} />, rootElement);
