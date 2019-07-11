import React from "react";
import ReactDOM from "react-dom";
import "../utils/gaInit";
import Root from "./components/Root";
import store from "./store";

ga("create", "UA-81509238-9", "auto");
ga("set", "anonymizeIp", true);
ga("send", "pageview", "config");

const rootElement = document.getElementById("root");
ReactDOM.render(<Root store={store} />, rootElement);
