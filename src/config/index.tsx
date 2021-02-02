import * as React from "react";
import ReactDOM from "react-dom";
import "../utils/gaInit";
import Root from "./components/Root";
import store from "./store";

ga("create", "UA-81509238-9", {
	cookieFlags: "max-age=7200;secure;samesite=none",
});
ga("set", "anonymizeIp", true);
ga("send", "pageview", "/config.html");

const rootElement = document.getElementById("root");
ReactDOM.render(<Root store={store} />, rootElement);
